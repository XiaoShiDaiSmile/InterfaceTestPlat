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
        $(".layui-tab-body").append('<div class="layui-nav-item layui-show">'+op.content+'</div>');
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
        });
        $("body").off("mouseenter",".layui-nav-setting").on("mouseenter",".layui-nav-setting",function(){
            var child = $(this).find(".layui-nav-child");
        })



    }
}