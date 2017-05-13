$(function() {



	var toolbar_opened = false;

    var old_id;

    function toolbar_expand(toolbar) {
    	$('.flyout-btn').addClass('btn-rotate');
    	// $(".flyout").find("a").attr('class', 'btn');

        var $toolbar = $(toolbar);

        var startAng = 0;
        var endAng = 360;
        var distinct = 8;
        var items = $toolbar.find('li');
        var items_len = items.length;

        items.each(function(index, el) {
        	
        	var itemAng =  Math.abs(endAng - startAng) / items_len * index;
                // - (index%2)* distinct*0.4 
        	var tx = (distinct  )*Math.cos(Math.PI/180 * itemAng);
        	var ty =  (distinct   )*Math.sin(Math.PI/180 * itemAng);
        	$(el).css('transition-delay',index/50+'s');
        	$(el).css('transform','translate('+tx+'rem,'+ty+'rem)');
        });


        return $('.flyout').removeClass('flyout-init fade').addClass('expand');
        // '.toolbar-menu'

    }

    function toolbar_inexpand(toolbar) {
    	var $toolbar = $(toolbar);

    	// $toolbar.find('li').css('transition-delay','');
    	$toolbar.find('li').css('transform','');

    	$('.flyout-btn').removeClass('btn-rotate');
    	return $('.flyout').removeClass('expand');
    	// $(".flyout").find("a").attr('class', 'btn');

        // var $toolbar = $(toolbar);
        // var startAng = 0;
        // var endAng = 2*Math.PI;


        // '.toolbar-menu'

    }


    var $draggable = $('.toolbar-menu').draggabilly({
    	containment: 'body'
        // options...
    });

    $('.flyout-btn').on('tap',function() {
        // toggleClass("btn-rotate");
        if(!toolbar_opened){
        	 toolbar_expand($draggable);
        }else{
        	 toolbar_inexpand($draggable);
        }
        toolbar_opened = !toolbar_opened;
    });

    $('.flyout').find('a').on('tap',function() {
        // $(".flyout-btn").toggleClass("btn-rotate");
        // $(".flyout").removeClass("expand").addClass("fade");
        var id = $(this).attr('id');

        // pencil
        // eraser
        // brush
        // line
        // circle
        // rect
        // color
        // background
        // width
        // text
        // undo
        // redo
        // copy
        // cut
        // clear
        // picker
        // old_id = $(this).closest('ul').find('.clicked').attr('id');
        window.GameCanvasContext.action(id,old_id);
        if(['pencil_btn','eraser_btn','brush_btn','line_btn','rect_btn','circle_btn','text_btn','hand_btn','copy_btn','picker_btn'].indexOf(id) >= 0){
            $(this).closest('ul').find('.clicked').removeClass('clicked');
            $(this).addClass('clicked');
        }
        old_id = id;
        
    });

    // $('.toolbar-menu .btn,.toolbar-menu .flyout-btn').hover(function () {
    //     var _this = this;
    //     $(_this).addClass('animated tada infinite');
        
    // },function () {
    //     var _this = this;
    //     $(_this).removeClass('animated tada infinite');
    // });

    $draggable.find('li').each(function (index,el) {
        $(el).tinytip({
            tooltip: $(el).find('img').attr('alt'),
            //when to show tooltip event (default: mouseenter)
            on : 'mouseenter',

            //when to hide tooltip event (default: mouseleave)
            off: 'mouseleave'
        });
    })


});
