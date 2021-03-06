import {decode} from 'html-entities';

window.addEventListener('DOMContentLoaded', (event) => {
    
    
    const searchbox = document.getElementById('searchbox');

    const searchClient = algoliasearch('OBYNAPJHA8', '270b7adc91a10fff762de99c1dc3ddc7');
    
    const search = instantsearch({
        indexName: 'BLOG',
        searchClient,
        routing: true,
        stalledSearchDelay: 200,
        searchFunction(helper) {
            // Ensure we only trigger a search when there's a query
            const hitsContainer = document.querySelector('#hits');
            const searchInput = document.querySelector('#searchbox .ais-SearchBox-input');
            if(searchbox){
                if (helper.state.query) {
                    helper.search();
                    if(hitsContainer){
                        hitsContainer.style.display = 'block';
                    }
                    searchInput.classList.add('active');
                }else{
                    if(hitsContainer){
                        hitsContainer.style.display = 'none';
                    }
                    searchInput.classList.remove('active');
                }
            }
        }
    });

    if(searchbox){
        search.addWidgets([

            instantsearch.widgets.configure({
                hitsPerPage: 10,
                attributesToSnippet: ['content:50', 'description:20'],
            }),

            instantsearch.widgets.queryRuleCustomData({
                container: '#searchbox',
                templates: {
                default: '',
                },
                transformItems(items) {
                const match = items.find(data => Boolean(data.redirect));
                if (match && match.redirect) {
                    window.location.href = match.redirect;
                }
                return [];
                },
            }),

            instantsearch.widgets.searchBox({
                container: '#searchbox',
                placeholder: 'Search site',
                showLoadingIndicator: true,
                autofocus: true,
                searchAsYouType: true
                // showReset: true,
                // showSubmit: true,
            })
        ]);
    }

    search.start();

    search.on('render', () => {
        document.querySelector('#searchbox .ais-SearchBox-input').focus();
    });
    

    if(document.getElementById('tagslist')){
        search.addWidgets([
            instantsearch.widgets.refinementList({
                container: "#tagslist",
                attribute: "kind",
                item: `
                    <a href="{{url}}" style="{{#isRefined}}font-weight: bold{{/isRefined}}">
                        <span>{{label}} ({{count}})</span>
                    </a>
                    `
            })
        ])
    };

        

    if(document.getElementById('hits')){
        search.addWidgets([
            instantsearch.widgets.hits({
                container: '#hits',
                templates: {
                    empty: '<div class="noResults">No results for <q>{{ query }}</q></div>',
                    item(hit, bindEvent) {

                        let template = '';
                        console.log(hit.kind)
                        if(hit.kind == 'youtube'){
                            var desired = hit.description.replace(/[^\w\s]/gi, '')
                            console.log(hit)
                            template = `
                                <a class="post-summary youtube-result" href="${hit.url}" ${bindEvent('conversion', hit, 'Search used')} >
                                    <article>
                                        <img class="youtube-thumbnail" src="${hit.thumbnails.medium.url}" />
                                        <div class="youtube-text">
                                            <h3>${decode(instantsearch.highlight({ attribute: 'title', hit }))}</h3>
                                            <div class="youtube-meta">
                                                <span class="youtube-icon"></span>
                                                <p>Published by ${hit.videoOwnerChannelTitle}</p>
                                            </div>
                                            <p>${decode(instantsearch.snippet({ attribute: 'description', hit }))}</p>
                                        </div>
                                    </article>
                                </a>`;

                        }else if(hit.kind == 'page'){ 
                            template = `
                                <a class="post-summary" href="${hit.url}" ${bindEvent('conversion', hit, 'Search used')} >
                                    <article>
                                        <h3>${decode(instantsearch.highlight({ attribute: 'title', hit }))}</h3>
                                        <p>${decode(instantsearch.snippet({ attribute: 'content', hit }))}</p>
                                    </article>
                                </a>`;

                            if(hit.type === 'categories'){
                                template = `
                                <a class="searchHitCategory" href="${hit.url}" ${bindEvent('conversion', hit, 'Search categories used')} >
                                    <article>
                                        <div class="searchHitCategoryTitle">${instantsearch.highlight({ attribute: 'title', hit })}</h3>
                                    </article>
                                </a>`;
                                
                            }
                        }
                        return template;
                    }
                }
            })
        ])
    }

    


    let queryBox = document.getElementById('querybox');
    if(queryBox){
        console.log('found query box')

        let timer = null;

        queryBox.addEventListener("blur", ()=>{
            console.log('clearing timeout')
            window.clearTimeout(timer);
        })

        queryBox.addEventListener("keydown", ()=>{
            console.log('setting timeout')
            timer = window.setTimeout(() => {
                let query = queryBox.value;
                window.location.href = `/search/?BLOG%5Bquery%5D=${query}`
            }, 1500);
        })

    }
    
});
