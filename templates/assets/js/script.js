// 输入框获取焦点
window.onload = function () {
    var text = document.getElementById('search-text');
    text.focus();
};

const searchInput = document.getElementById('search-text');
const wordList = document.getElementById('word').getElementsByTagName('li');
let selectedWordIndex = -1;
let ignoreKeyEvents = false; // 标志用于判断是否忽略键盘事件

// 监听键盘事件
searchInput.addEventListener('keydown', function (event) {
    switch (event.key) {
        case 'ArrowUp':
            event.preventDefault();
            selectPreviousWord();
            fillInputWithSelectedWord();
            break;
        case 'ArrowDown':
            event.preventDefault();
            selectNextWord();
            fillInputWithSelectedWord();
            break;
        default:
            ignoreKeyEvents = false; // 其他键盘事件恢复正常
            break;
    }
});

// 选中上一个选项
function selectPreviousWord() {
    if (selectedWordIndex > 0) {
        wordList[selectedWordIndex].classList.remove('selected');
        selectedWordIndex--;
        wordList[selectedWordIndex].classList.add('selected');
    }
}

// 选中下一个选项
function selectNextWord() {
    if (selectedWordIndex < wordList.length - 1) {
        if (selectedWordIndex >= 0) {
            wordList[selectedWordIndex].classList.remove('selected');
        }
        selectedWordIndex++;
        wordList[selectedWordIndex].classList.add('selected');
    }
}

// 将选中的选项填入输入框
function fillInputWithSelectedWord() {
    if (selectedWordIndex !== -1) {
        searchInput.value = wordList[selectedWordIndex].innerText;
        ignoreKeyEvents = true; // 标记忽略键盘事件
    }
}

// 关键词搜索建议
$(function () {
    // 当键盘键被松开时发送Ajax获取数据
    $('#search-text').on('keyup', function () {
        if (!ignoreKeyEvents) { // 只有在标志为false时才执行
            var keywords = $(this).val();
            if (keywords == '') {
                $('#word').hide();
                return;
            }
            $.ajax({
                url: 'https://suggestion.baidu.com/su?wd=' + encodeURIComponent(keywords),
                dataType: 'jsonp',
                jsonp: 'cb',
                timeout: 5000, // 添加超时限制
                beforeSend: function () {
                    // $('#word').append('<li>正在加载。。。</li>');
                },
                success: function (data) {
                    $('#word').empty().show();
                    if (data.s == '') {
                        $('#word').empty();
                        $('#word').hide();
                    }
                    $.each(data.s, function () {
                        $('#word').append('<li>' + this + '</li>');
                    });
                    // 重新设置选中词汇的索引
                    selectedWordIndex = -1;
                },
                error: function () {
                    $('#word').empty().hide();
                }
            });
        }
    });

    // 点击搜索数据复制给搜索框
    $(document).on('click', '#word li', function () {
        var word = $(this).text();
        $('#search-text').val(word);
        $('#word').empty();
        $('#word').hide();
        $('.submit').trigger('click'); // 触发搜索事件
    });

    // 点击页面其他区域隐藏搜索建议
    $(document).on('click', '.container,.banner-video,nav', function () {
        $('#word').empty();
        $('#word').hide();
    });
});

// 类型选择器交互
$(function () {
    $('.type-right').click(function (e) {
        $('#type-left').toggleClass('showListType');
        e.stopPropagation(); // 阻止冒泡
    });

    $(document).click(function (e) {
        var con = $('.type-left');
        if (!con.is(e.target)) {
            con.toggleClass('showListType', false);
        }
    });

    $(document).click(function (e) {
        var con = $('.collapse');
        if (!con.is(e.target)) {
            con.toggleClass('show', false);
        }
    });

    $('.type-left ul li').click(function () {
        $(this).addClass('active').siblings('li').removeClass('active');
        $('.type-left').toggleClass('showListType');
        var lylme_tag = '#' + $(this).attr("data-lylme");
        $('html,body').animate({ scrollTop: $(lylme_tag).offset().top }, 500);
    });
});

// 搜索引擎切换功能
(function () {
    function initializeSearch() {
        selectDefaultSearchEngine();
        updatePlaceholder();
        updateFormAction();
    }

    function selectDefaultSearchEngine() {
        var storedType = window.localStorage.getItem("superSearchtype");
        var defaultType = storedType || searchEngineInputs[0].value;
        var input = document.querySelector('input[name="type"][value="' + defaultType + '"]');
        if (input) {
            input.checked = true;
            highlightSelectedSearchEngine(input);
        }
    }

    function updatePlaceholder() {
        var checkedInput = document.querySelector('input[name="type"]:checked');
        var placeholder = checkedInput ? checkedInput.getAttribute("data-placeholder") : "";
        searchTextInput.setAttribute("placeholder", placeholder);
    }

    function updateFormAction() {
        var checkedInput = document.querySelector('input[name="type"]:checked');
        var actionUrl = checkedInput ? checkedInput.value : "";
        searchForm.action = actionUrl;
    }

    function highlightSelectedSearchEngine(input) {
        for (var i = 0; i < searchGroups.length; i++) {
            searchGroups[i].classList.remove("s-current");
        }
        if (input && input.parentNode && input.parentNode.parentNode && input.parentNode.parentNode.parentNode) {
            input.parentNode.parentNode.parentNode.classList.add("s-current");
        }
    }

    function handleSearchEngineChange(event) {
        currentSearchEngine = event.target;
        updatePlaceholder();
        updateFormAction();
        window.localStorage.setItem("superSearchtype", event.target.value);
        searchTextInput.focus();
        highlightSelectedSearchEngine(event.target);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        if (searchTextInput.value === "") {
            searchTextInput.focus();
            return false;
        }
        var currentAction = document.querySelector('input[name="type"]:checked').value;
        searchForm.action = currentAction + searchTextInput.value;
        if (searchForm.target === '_blank') {
            window.open(searchForm.action, '_blank');
        } else {
            location.href = searchForm.action;
        }
    }

    var searchEngineInputs = document.querySelectorAll('input[name="type"]');
    var searchForm = document.querySelector("#super-search-fm");
    var searchTextInput = document.querySelector("#search-text");
    var searchGroups = document.querySelectorAll(".search-group");
    var currentSearchEngine = searchEngineInputs[0];

    initializeSearch();

    for (var i = 0; i < searchEngineInputs.length; i++) {
        searchEngineInputs[i].addEventListener("change", handleSearchEngineChange);
    }

    if (searchForm) {
        searchForm.addEventListener("submit", handleFormSubmit);
    }
})();

// 返回顶部功能
(function ($) {
    $.fn.scrollToTop = function (options) {
        var settings = $.extend({
            speed: 800
        }, options);

        return this.each(function () {
            var $this = $(this);

            $(window).scroll(function () {
                if ($(this).scrollTop() > 100) {
                    $this.fadeIn();
                } else {
                    $this.fadeOut();
                }
            });

            $this.click(function (e) {
                e.preventDefault();
                $("body, html").animate({ scrollTop: 0 }, settings.speed);
            });
        });
    };
})(jQuery);

// 初始化返回顶部按钮
$(function () {
    var backToTopHtml = '<a href="javascript:void(0)" id="toTop" ' +
        'style="display:none;position:fixed;bottom:66px;right:10px;' +
        'width:48px;height:48px;' +
        'background-image:url(\'data:image/svg+xml;base64,PHN2ZyB0PSIxNjU0OTM5MTkxNTY0IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEyMTgiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHBhdGggZD0iTTUxMyAxMDMuN2MtMjI2LjEgMC00MDkuNCAxODMuMy00MDkuNCA0MDkuNFMyODYuOSA5MjIuNiA1MTMgOTIyLjZzNDA5LjQtMTgzLjMgNDA5LjQtNDA5LjRTNzM5LjEgMTAzLjcgNTEzIDEwMy43eiBtMTUzLjUgMzY0LjdjLTUuMiA1LjMtMTIuMSA3LjktMTkgNy45cy0xMy44LTIuNi0xOS03LjlMNTQ1LjEgMzg1YzAgMC40IDAuMSAwLjcgMC4xIDEuMVY3MDVjMCAxMS4xLTUuNyAyMC45LTE0LjQgMjYuNi00LjcgNC4yLTEwLjkgNi43LTE3LjcgNi43LTYuOCAwLTEzLTIuNS0xNy43LTYuNy04LjctNS43LTE0LjQtMTUuNS0xNC40LTI2LjZWMzg2LjFjMC0wLjQgMC0wLjcgMC4xLTEuMWwtODMuNCA4My40Yy0xMC41IDEwLjUtMjcuNSAxMC41LTM4IDBzLTEwLjUtMjcuNSAwLTM4TDQ5NCAyOTUuOWMxMC41LTEwLjUgMjcuNS0xMC41IDM4IDBsMTM0LjUgMTM0LjVjMTAuNSAxMC40IDEwLjUgMjcuNSAwIDM4eiIgZmlsbD0iIzE1NzJlZiIgcC1pZD0iMTIxOSI+PC9wYXRoPjwvc3ZnPg==\');' +
        'z-index:999;opacity:0.9;" ' +
        'aria-label="返回顶部" role="button">' +
        '</a>';

    $("body").append(backToTopHtml);
    $("#toTop").scrollToTop({ speed: 300 });
});
