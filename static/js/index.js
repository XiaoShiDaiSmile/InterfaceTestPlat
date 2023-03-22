//--basejs--
var layui = function(){
    var that = this,
        o = this.options,
        id = o&&o.id?o.id:o.index;
    if(id){
        layui.that[id] = that;
        layui.config[id] = o;
    }
};
layui.that = {};
layui.config = {};
layui.each = function(obj,fn){
    var that = this,
        key,
        callFn = function(obj,key){
            return fn.call(obj[key],obj[key],key);
        };
    if(typeof fn !== "function")return that;
    if(layui._isArray(obj)){
        for(key=0;key<obj.length;key++){
            if(callFn(obj,key))break;
        }
    }else{
        for(key in obj){
            if(callFn(obj,key))break;
        }
    };
    return that;
};
layui._isArray = function(obj){
    var that = this,
        len,
        type = layui._typeOf(obj);
    if(!obj || typeof obj !== "object"||obj === window)return false;
    len = "length" in obj && obj.length;
    return type === "array" || len>0 || (
        typeof len === "number" && len<=0 && (len-1) in obj
    )
};
layui._typeOf = function(operand){
    if(operand === null)return String(operand);
    return (typeof operand === "object" || typeof operand === "function")?function(){
        var type = Object.prototype.toString.call(operand).match(/\s(.*)\]$/),
        classType = 'Object|Array|Function|RegExp|Symbol|Error';
        type = type[1] || "object";
        return new RegExp('\\b('+classType+')\\b').test(type)?type.toLowerCase():"object";
    }():typeof operand;
};

//--menujs--
var menu = {
    v:'1.0.0',
    config:{},
    index:0
};
menu.render = function(options){
    var inst = new Menu(options);
    layui.call(inst);
    return inst.index;
};
var Menu = function(options){
    var that = this;
    that.options = $.extend({},that.config,menu.config,options);
    that.index = ++menu.index;
    that.id = options&&("id" in options)?options.id:that.index;
    that.init();
};
Menu.prototype = {
    constructor:menu,
    config:{
        side:false,
        single:false
    },
    init:function(){
        var that = this,
            o = this.options;
        that.pullData();
        that.listen();
    },
    pullData:function(){
        var that = this,
            o = this.options;
        o.request = $.extend({},{
            pageName:'curr',
            limitName:'limit'
        },o.request);
        o.response = $.extend({},{
            codeName:'code',
            codeStatus:0,
            dataName:'data',
            dataType:'json',
            totalRowName:'totalRow',
            countName:'count'
        },o.response);
        if(o.url){
            var params = {};
            params[o.request.pageName] = o.curr;
            params[o.request.limitName] = o.limit;
            var data = $.extend(params,o.where);
            if(o.contentType&&o.contentType.indexOf("application/json")===0){
                data = JSON.stringify(data);
            }
            $.ajax({
                url:o.url,
                type:o.method||"get",
                data:data,
                contentType:o.contentType,
                headers:o.headers||{},
                dataType:'json',
                success:function(res){
                    o.data = res.data?res.data:[];
                    that.render(o.data);
                },
                error:function(res){
                    console.log(res);
                }
            })
        }else if(layui._typeOf(o.data)==="array"){
            o.data = o.data?o.data:[];
            that.render(o.data);
        }
    },
    render:function(data){
        var that = this,
            o = this.options;
        o.side&&(
            $("[data-side-fold]").attr("data-side-fold",0).addClass("layui-icon-toggle-right").removeClass("layui-icon-toggle-left"),
            $("body").addClass("layui-mini").removeClass("layui-all")
        )
        if(o.single){
            that.renderSingleHtml(data);
        }else{
            that.renderMultipleHtml(data);
        }
    },
    renderSingleHtml:function(data){
        var that = this,
            o = this.options;
    },
    renderMultipleHtml:function(data){
        var that = this,
            o = this.options,
            topHtml = '',
            leftHtml = '',
            topActiveClass = 'layui-this',
            leftActiveClass = 'layui-show';
        layui.each(data,(item1,i1) => {
            topHtml += that.renderTopHtml({
                title:item1.title,
                icon:item1.icon,
                href:item1.href,
                target:item1.target,
                className:topActiveClass,
                menu:'menu_'+i1
            });
            leftHtml += that.renderLeftHtml(item1.child,{
                parentId:'menu_'+i1,
                className:leftActiveClass
            })
            topActiveClass = '';
            leftActiveClass = 'layui-hide';
        });
        $(window.parent.document).find(".layui-header-menu").empty().append(topHtml);
        $(window.parent.document).find(".layui-side").empty().append(leftHtml);
    },
    renderUlHtml:function(o,isSub){
        var that = this,
            wrapHtml = '';
        wrapHtml = '<ul class="layui-nav layui-nav-tree '+o.className+'" id="'+o.id+'">'+o.children+'</ul>';
        if(isSub){
            wrapHtml = '<dl class="layui-nav-child">'+o.children+'</dl>';
        }
        if(!o.children){
            return;
        }
        return wrapHtml;
    },
    renderChildHtml:function(d){
        var that = this,
            html = '',
            d = d || [];
        layui.each(d,(item1,i1) => {
            if(item1.child&&item1.child.length){
                item1.children = that.renderChildHtml(item1.child);
            }
            html += that.renderTopHtml(item1,true);
        });
        return that.renderUlHtml({children:html},true);
    },
    renderLeftHtml:function(d,o){
        var that  = this,
            leftHtml = '',
            d = d || [];
        layui.each(d,(item1,i1) => {
            var children = that.renderChildHtml(item1.child);
            leftHtml += that.renderTopHtml({
                title:item1.title,
                icon:item1.icon,
                href:item1.href,
                target:item1.target,
                className:'',
                children:children
            });
        });
        leftHtml = that.renderUlHtml({children:leftHtml,id:o.parentId,className:o.className});
        return leftHtml;
    },
    renderTopHtml:function(o,isSub){
        var that = this,
            topHtml = '';
        topHtml = '<li class="layui-nav-item menu-li '+o.className+'"'+
            (o.menu?' data-menu="'+o.menu+'"':'')+
        '><a '+
            (o.href?' data-href="'+o.href+'"':'')+
        '>'+
            (o.icon?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'<i class="layui-icon layui-icon-file"></i>')+
            '<span class="layui-left-nav">'+o.title+'</span>'+
            (o.children?'<i class="layui-icon layui-icon-arrow-down-bold"></i>':'')+
        '</a>'+
            (o.children?''+o.children+'':'')+
        '</li>';
        if(isSub){
            topHtml = '<dd class="menu-dd"><a '+
                ((!o.children||!o.children.length)&&o.href?' data-href="'+o.href+'"':'')+
            '>'+
                 (o.icon?'<i class="layui-icon layui-icon-'+o.icon+'"></i>':'<i class="layui-icon layui-icon-file"></i>')+
                '<span class="layui-left-nav">'+o.title+'</span>'+
                (o.children?'<i class="layui-icon layui-icon-arrow-down-bold"></i>':'')+
            '</a>'+
                (o.children?''+o.children+'':'')+
            '</dd>';
        }
        return topHtml;
    },
    checktab:function(href,isframe){
        var that = this,
            o = this.options,
            checkable = false;
        layui.each($(".layui-tab-title li"),(item1,i1) => {
            var tabid = $(item1).attr("lay-id");
            if(tabid!==null&&tabid===href){
                checkable = true;
            }
        });
        return checkable;
    },
    createFrame:function(op){
        var that = this,
            o = this.options,
            txt = function(){
                var arr = [],t = '';
                layui.each(op,(item1,i1) => {
                    if(/^title|content$/.test(i1))return;
                    arr.push('lay-id="'+op[i1]+'"');
                    if(arr.length>0)arr.unshift("");
                    t = arr.join("");
                })
                return t;
            }();
        var li = '<li '+txt+'>'+op.title+'</li>';
        $(".layui-tab-title").append(li);
        $(".layui-tab-body").append('<div class="layui-tab-item layui-show">'+op.content+'</div>');
    },
    openTabRightMenu:function(href,left){
        var that = this,
            o = this.options;
        that.closeTabRightMenu();
        var html = '<div class="layui-unselect layui-tab-mousedown layui-show" data-id="'+href+'" style="left:'+left+'px;">'+
                '<dl>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="refresh">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>刷新当前</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="current">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭当前</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="other">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭其他</span>'+
                        '</a>'+
                    '</dd>'+
                    '<dd>'+
                        '<a href="javascript:;" data-mousedown-close="all">'+
                            '<i class="layui-icon layui-icon-setting"></i>'+
                            '<span>关闭全部</span>'+
                        '</a>'+
                    '</dd>'+
                '</dl>'+
            '</div>';
        $(".layui-tab-title").after(html);
    },
    closeTabRightMenu:function(){
        var that = this,
            o = this.options;
        $(".layui-tab-mousedown").remove();
    },
    deletetab:function(href){
        var that = this,
            o = this.options,
            othis = $("[lay-id='"+href+"']"),
            index = othis.index();
        if(othis.hasClass("layui-this")){
            if(othis.next()[0]){
                $(othis.next()[0]).addClass("layui-this").siblings().removeClass("layui-this");
                $(".layui-tab-item").eq(index+1).addClass("layui-show").siblings().removeClass("layui-show");
            }else if(othis.prev()[0]){
                $(othis.prev()[0]).addClass("layui-this").siblings().removeClass("layui-this");
                $(".layui-tab-item").eq(index-1).addClass("layui-show").siblings().removeClass("layui-show");
            }
        }
        othis.remove();
        $(".layui-tab-item").eq(othis.index()).remove();
    },
    rollClick:function(dire){
        var that = this,
            o = this.options,
            titleElem = $(".layui-tab-title"),
            scrollLeft = titleElem.scrollLeft();
        if(dire==="left"){
            titleElem.animate({
                scrollLeft:scrollLeft-136
            },300)
        }else{
            titleElem.animate({
                scrollLeft:scrollLeft+136
            },300)
        }
    },
    setPosition:function(){
        var that = this,
            o = this.options,
            titleElem = $(".layui-tab-title"),
            scrollLeft = 0;
        $(".layui-tab-title li").each((index,item) => {
            if($(item).hasClass("layui-this")){
                return false;
            }else{
                scrollLeft += $(item).outerWidth();
            }
        });
        titleElem.animate({
            scrollLeft:scrollLeft-titleElem.width()/3
        },300)
    },
    listen:function(){
        var that = this,
            o = this.options;
        $("body").off("click","[data-side-fold]").on("click","[data-side-fold]",function(){
            $(this).attr("data-side-fold")==="1"?(
                $(this).attr("data-side-fold",0).addClass("layui-icon-toggle-right").removeClass("layui-icon-toggle-left"),
                $("body").addClass("layui-mini").removeClass("layui-all")
            ):(
                $(this).attr("data-side-fold",1).addClass("layui-icon-toggle-left").removeClass("layui-icon-toggle-right"),
                $("body").addClass("layui-all").removeClass("layui-mini")
            )
        });
        $("body").off("click","[data-menu]").on("click","[data-menu]",function(){
            $(this).addClass("layui-this").siblings().removeClass("layui-this");
            $("#"+$(this).attr("data-menu")).addClass("layui-show").removeClass("layui-hide").siblings().addClass("layui-hide").removeClass("layui-show");
        });
        $("body").off("click","[data-href]").on("click","[data-href]",function(){
            var othis = $(this),
                title = othis.find("span").text(),
                href = othis.attr("data-href");
            if(othis.siblings().length>0||othis.parents(".layui-header-menu").length>0)return;
            if(othis.length&&!othis.siblings().length){
                othis.closest(".layui-side").find(".layui-this").removeClass("layui-this");
                othis.parent().addClass("layui-this");
            }
            var checkable = that.checktab(href,true);
            if(!checkable){
                that.createFrame({
                    title:'<i class="layui-tab-active"></i><span>'+title+'</span><i class="layui-tab-close layui-icon layui-icon-close"></i>',
                    content:'<iframe src="'+href+'" frameborder="0" border="0" width="100%" height="100%" maxwidth="0" maxlength="0"></iframe>',
                    tabid:href
                })
            }
            $("[lay-id='"+href+"']").addClass("layui-this").siblings().removeClass("layui-this");
            $(".layui-tab-item").eq($("[lay-id='"+href+"']").index()).addClass("layui-show").siblings().removeClass("layui-show");
        });
        $("body").off("click",".layui-side a").on("click",".layui-side a",function(){
            var othis = $(this).siblings(),
                parent = othis.parent();
            if(othis.length){
                parent[othis.css("display")==="none"?'addClass':'removeClass']("layui-nav-itemed");
            }
        });
        $("body").off("click",".layui-tab-title li").on("click",".layui-tab-title li",function(){
            $(this).addClass("layui-this").siblings().removeClass("layui-this");
            $(".layui-tab-body .layui-tab-item").eq($(this).index()).addClass("layui-show").siblings().removeClass("layui-show");
            that.setPosition();
        });
        $("body").off("mouseenter",".layui-tab-tool").on("mouseenter",".layui-tab-tool",function(){
            var child = $(this).find(".layui-nav-child");
            if(child.css("display")==="block"){
                clearTimeout(that.timer);
            }
            that.timer = setTimeout(function(){
                child.addClass("layui-show");
            },300)
        }).off("mouseleave",".layui-tab-tool").on("mouseleave",".layui-tab-tool",function(){
            var child = $(this).find(".layui-nav-child");
            clearTimeout(that.timer);
            that.timer = setTimeout(function(){
                child.removeClass("layui-show");
            },300)
        });
        $("body").unbind("mousedown",".layui-tab-title li").bind("contextmenu",".layui-tab-title li",function(e){
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
        $("body").off("mousedown",".layui-tab-title li").on("mousedown",".layui-tab-title li",function(e){
            var left = $(this).offset().left-$(".layui-tab-title").offset().left+($(this).width()/2),
                href = $(this).attr("lay-id");
            if(e.which===3){
                that.openTabRightMenu(href,left);
            }
        });
        $("body").off("click",".layui-header,.layui-side,.layui-tab-title,.layui-body").on("click",".layui-header,.layui-side,.layui-tab-title,.layui-body",function(){
            that.closeTabRightMenu();
        });
        $("body").off("click","[data-mousedown-close]").on("click","[data-mousedown-close]",function(){
            var closeType = $(this).attr("data-mousedown-close"),
                currentid = $(this).parents(".layui-tab-mousedown").attr("data-id");
            if(closeType==="refresh"){
                $(".layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload();
            }
            layui.each($(".layui-tab-title li"),(item1,i1) => {
                var href = $(item1).attr("lay-id"),
                    id = $(item1).attr("id");
                if(id!=="layuitab"){
                    if(closeType==="all"){
                        that.deletetab(href);
                    }else{
                        if(closeType==="current"&&currentid===href){
                            that.deletetab(href);
                        }else if(closeType==="other"&&currentid!==href){
                            that.deletetab(href);
                        }
                    }
                }
            })
        });
        $("body").off("click","[data-tab-close]").on("click","[data-tab-close]",function(){
            var closeType = $(this).attr("data-tab-close");
            if(closeType==="refresh"){
                $(".layui-tab-item.layui-show").find("iframe")[0].contentWindow.location.reload();
            }
            layui.each($(".layui-tab-title li"),(item1,i1) => {
                var href = $(item1).attr("lay-id"),
                    id = $(item1).attr("id"),
                    iscurrent = $(item1).hasClass("layui-this");
                if(id!=="layuitab"){
                    if(closeType==="all"){
                        that.deletetab(href);
                    }else{
                        if(closeType==="current"&&iscurrent){
                            that.deletetab(href);
                        }else if(closeType==="other"&&!iscurrent){
                            that.deletetab(href);
                        }
                    }
                }
            })
        });
        $("body").off("click",".layui-tab-title .layui-tab-close").on("click",".layui-tab-title .layui-tab-close",function(){
            that.deletetab($(this).parent().attr("lay-id"));
        });
        $("body").off("click",".layui-roll-left").on("click",".layui-roll-left",function(){
            that.rollClick("left");
        });
         $("body").off("click",".layui-roll-right").on("click",".layui-roll-right",function(){
            that.rollClick("right");
        });


    }
}