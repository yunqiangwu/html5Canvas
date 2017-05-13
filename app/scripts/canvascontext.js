var GameCanvasContext = {};
window.GameCanvasContext = GameCanvasContext;

var navIsShow = true;
var canvasContainer = $('.main-canvas-container');
var canvasWrap = $('.canvas-wrap');
var canvas = $('#canvas')[0];
var canvasTemp = $('#canvas-temp')[0];
var ctxTemp = canvasTemp.getContext('2d');
var c_w = 550,
    c_h = 400;
/**
  
  pencil 画笔工具


*/
GameCanvasContext.canvasMode = 'pencil_btn';



var canvas = GameCanvasContext.canvas = canvas;
var ctx = GameCanvasContext.ctx = GameCanvasContext.canvas.getContext('2d');
var bgColor = 'rgba(255,255,255,.3)';
var strokeColor = '#000';
var fillColor = '#00ff00';
var lineWidth = 5;
var widthSlider = null;

GameCanvasContext.ctx.fillStyle = fillColor
GameCanvasContext.ctx.strokeStyle = strokeColor;
GameCanvasContext.ctx.lineWidth = lineWidth;
GameCanvasContext.ctx.lineCap = 'round';




GameCanvasContext.centerCanvas = function centerCanvas(w, h) {
    var canvasWrapOuterWidth = canvasWrap.outerWidth();
    var canvasWrapOuterHeight = canvasWrap.outerHeight();
    var canvasWrapInnerWidth = canvasWrap.innerWidth();
    var canvasWrapInnerHeight = canvasWrap.innerHeight();
    var canvasContainerInnerWidth = canvasContainer.innerWidth();
    var canvasContainerInnerHeight = canvasContainer.innerHeight();

    var left = (canvasContainerInnerWidth - canvasWrapOuterWidth) / 2;
    var top = (canvasContainerInnerHeight - canvasWrapOuterHeight) / 2;

    // canvasWrap.css({
    //   'top':top,
    //   'left':left
    // });


    canvasWrap.css({
        'width': w + 80,
        'height': h + 80
    });
    $('#canvas').css({
        // 'top': 0 + 'px',
        // 'left': 0 + 'px',
        'width': w,
        'height': h
    });
    GameCanvasContext.cscroll && GameCanvasContext.cscroll.refresh();



};

var startPoint = { x: 0, y: 0 };
var $currentTextel = null;
var textareael = null;
GameCanvasContext.draw = function(x, y, type, e) {
    var isRestore = false;
    try {
        var canvasMode = GameCanvasContext.canvasMode;
        switch (canvasMode) {

            case 'eraser_btn':
                if (type === 'dragstart' || type === 'drag' || type === 'dragend' || type === 'click') {
                    ctx.clearRect(x - 15, y - 5, 30, 30);
                } else {
                    window.console.log(type);
                    return;
                }
                break;

            case 'pencil_btn':

                if (type === 'dragstart') {
                    ctx.beginPath();
                    return GameCanvasContext.ctx.moveTo(x, y);
                } else if (type === 'drag') {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (type === 'dragend') {
                    return ctx.closePath();
                } else if (type === 'click') {
                    ctx.save();
                    isRestore=true;
                    ctx.fillStyle=strokeColor;
                    ctx.beginPath();
                    ctx.arc(x, y, ctx.lineWidth + 1, 0, Math.PI * 2, false);
                    ctx.fill();
                } else {
                    window.console.log(type);
                    return;
                }
                break;
            case 'brush_btn':
                drawBrush(x, y);
                break;
            case 'text_btn':
                if (type === 'click') {
                    // startPoint = { x: x, y: y };
                    if ($currentTextel) {
                        var text = textareael.val().trim();
                        if (text !== "") {
                          var tx = $currentTextel.position().left;
                          var ty = $currentTextel.position().top;
                          var tx2 = $(canvas).position().left;
                          var ty2 = $(canvas).position().top;
                          tx = tx-tx2+5;
                          ty = ty-ty2+23;
                          var txtStyle = window.getComputedStyle(textareael[0]);
                          drawText(text,tx,ty,textareael.width() ,textareael.height(),txtStyle);
                        }
                        $currentTextel.remove();
                        $currentTextel = null;
                    }
                    if ($currentTextel == null) {
                        var canvasOffset = $(canvas).offset();
                        $currentTextel = $("<div class='textEl'><div class='handle'/><div class='handle'/><div class='handle'/><div class='handle'/><div class='resizeHandle' /><textarea /></div>")
                            .appendTo('#main-canvas-container')
                            .draggabilly({ handle: '.handle',containment: '#canvas' })
                            .css({ left: e.pageX - canvasOffset.left + 'px', top: e.pageY - canvasOffset.top + 'px' })
                            .find('textarea')
                            .css('color',strokeColor)
                            .mouseup(function() {
                                var $this = jQuery(this);
                                if ($this.outerWidth() != $this.data('x') || $this.outerHeight() != $this.data('y')) {
                                    // Resize Action Here
                                    $currentTextel.width($this.width() + 12).height($this.height() + 12);
                                }
                                // store new height/width
                                $this.data('x', $this.outerWidth());
                                $this.data('y', $this.outerHeight());
                            }).parent();
                        textareael = $currentTextel.find('textarea');
                        $currentTextel.width(textareael.width() + 12).height(textareael.height() + 12);
                       textareael.focus();
                       return
                    }
                } else if (type === 'dragend') {
                    // alert(32);
                    return;
                }
                break;
            case 'line_btn':
            case 'circle_btn':
            case 'rect_btn':
                if (type === 'dragstart') {
                    startPoint = { x: x, y: y };
                    return;
                } else if (type === 'drag') {
                    drawTempShape(canvasMode, startPoint.x, startPoint.y, x, y);
                    return;
                } else if (type === 'dragend') {
                    drawShape(canvasMode, startPoint.x, startPoint.y, x, y);
                }
                break;
                // if(type)

        }
        ctxTemp.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    }catch(e){
      console.log(e);
    } finally {
        if (isRestore) {
            ctx.restore();
        }
    }
};
GameCanvasContext.clear = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

var isMouseDown = false;
var isdragMove = false;
var dragStartTime = +new Date();
var dragStartPoint = { x: 0, y: 0 };
var lastE = null;
var dragHandle = function(e) {

    // if(_this.mode == 2){
    e.preventDefault();
    var offset, type, x, y;
    type = e.type;
    if (e.touches) {
        e = e.touches[0];
        if (e) {
            lastE = e;
        } else {
            e = lastE;
        }

    }
    if (type === 'mousedown') {
        isMouseDown = true;
    }
    if (type === 'mouseup') {
        isMouseDown = false;
    }
    if (!isMouseDown && type === 'mousemove') {
        return;
    }
    offset = $(this).offset();
    x = e.clientX - offset.left;
    y = e.clientY - offset.top;

    if (type === 'touchstart' || type === 'mousedown') {
        type = 'dragstart';
        isdragMove = false;
        dragStartTime = +new Date();
        dragStartPoint.x = x;
        dragStartPoint.y = y;
    }
    if (type === 'touchmove' || type === 'mousemove') {
        type = 'drag';
        isdragMove = true;
    }
    if (type === 'touchend' || type === 'mouseup') {
        type = 'dragend';
        var now = new Date();
        if (+now - dragStartTime <= 200 && Math.sqrt((x - dragStartPoint.x) * (x - dragStartPoint.x) + (y - dragStartPoint.y) * (y - dragStartPoint.y)) < 3) {
            type = 'click';
        }
    }



    GameCanvasContext.draw(x * (canvas.width / c_w), y * (canvas.height / c_h), type, e);
    // _this.$emit('draw',x/canvas.width, y/canvas.height, type);
    // }
};

// canvas.addEventListener('touchstart touchmove touchend mousedown mousemove mouseup', dragHandle);


function resizeCanvas() {
    GameCanvasContext.centerCanvas(c_w, c_h);

    var p = $('.toolbar-menu').offset();
    var canvasContainerInnerWidth = canvasContainer.innerWidth();
    var canvasContainerInnerHeight = canvasContainer.innerHeight();
    var isChanged = false;
    if (p.left > canvasContainerInnerWidth) {
        p.left = canvasContainerInnerWidth - 30;
        isChanged = true;
    }
    if (p.top > canvasContainerInnerHeight) {
        p.top = canvasContainerInnerHeight - 30;
        isChanged = true;
    }
    if (isChanged) {
        $('.toolbar-menu').css(p);
    }

    if (navIsShow) {
        var p2 = $(canvasTemp).offset();
        isChanged = false;
        if (p2.left > canvasContainerInnerWidth) {
            p2.left = canvasContainerInnerWidth - $(canvasTemp).outerWidth();
            isChanged = true;
        }
        if (p2.top > canvasContainerInnerHeight) {
            p2.top = canvasContainerInnerHeight - $(canvasTemp).outerHeight();
            isChanged = true;
        }
        if (isChanged) {
            $(canvasTemp).css(p2);
        }

    }




}
GameCanvasContext.resizeCanvas = resizeCanvas;


function action(command, old_command) {
    console.log(command, old_command);


    if (old_command == 'hand_btn' && command != 'hand_btn') {
        closeHandMode();
        bindCanvasEvent();
    }
    if(old_command == "text_btn" && command != 'text_btn'){
      var text = textareael.val().trim();
      if (text !== "") {
        var tx = $currentTextel.position().left;
        var ty = $currentTextel.position().top;
        var tx2 = $(canvas).position().left;
        var ty2 = $(canvas).position().top;
        tx = tx-tx2+5;
        ty = ty-ty2+23;
        var txtStyle = window.getComputedStyle(textareael[0]);
        drawText(text,tx,ty,textareael.width() ,textareael.height(),txtStyle);
      }
      $currentTextel.remove();
      $currentTextel = null;
      ctxTemp.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    }

    switch (command) {
        case 'hand_btn':
            if (old_command == 'hand_btn')
                return;
            removeCanvasEvent();
            openHandMode();
            break;
        case 'zoomin_btn':
            zoomin();
            break;
        case 'zoomout_btn':
            zoomout();
            break;
        case 'clear_btn':
            GameCanvasContext.clear();
            break;
        case 'pencil_btn':
        case 'eraser_btn':
        case 'brush_btn':
        case 'pencil_btn':
        case 'line_btn':
        case 'circle_btn':
        case 'rect_btn':
        case 'text_btn':
            GameCanvasContext.changetool(command);
            break;
        case 'color_stroke_btn':
            // $('#color_stroke_btn').trigger('focusin.tcp')
            break;
        case 'color_fill_btn':
            // $('#color_fill_btn').trigger('focusin.tcp')
            break;
        case 'background_btn':
            // $('#background_btn').trigger('focusin.tcp')
            break;
        case 'width_btn':
            $('#borderSettingModal').modal('show');
            break;
    }
}
GameCanvasContext.action = action;

var is_inited;
GameCanvasContext.init = function() {

    if (is_inited)
        return;
    bindCanvasEvent();
    is_inited = true;

    var resizeTimer = null;
    window.addEventListener('resize', function() {
        window.clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 400);
    });

    var colorOptions = {
        // customBG: '#222',
        margin: '4px -2px 0',
        doRender: 'div div',
        preventFocus: true,
        animationSpeed: 0,

        // demo on how to make plugins... mobile support plugin
        buildCallback: function($elm) {
            this.$colorPatch = $elm.prepend('<div class="cp-disp">').find('.cp-disp');
            // $('.color').on('click', function(e) {
            //     e.preventDefault && e.preventDefault();
            // });
        },
        cssAddon: // could also be in a css file instead
            '.cp-disp{padding:10px; margin-bottom:6px; font-size:19px; height:20px; line-height:20px}' +
            '.cp-xy-slider{width:200px; height:200px;}' +
            '.cp-xy-cursor{width:16px; height:16px; border-width:2px; margin:-8px}' +
            '.cp-z-slider{height:200px; width:40px;}' +
            '.cp-z-cursor{border-width:8px; margin-top:-8px;}' +
            '.cp-alpha{height:40px;}' +
            '.cp-alpha-cursor{border-width: 8px; margin-left:-8px;}',

        renderCallback: function($elm, toggled) {
            var colors = this.color.colors;
            strokeColor = '#' + (colors.HEX);
            refreshColor();
            // this.$colorPatch.css({
            //     backgroundColor: '#' + colors.HEX,
            //     color: colors.RGBLuminance > 0.22 ? '#222' : '#ddd'
            // }).text(this.color.toString($elm._colorMode)); // $elm.val();
        }
    };

    $('#color_stroke_btn')
        .colorPicker($.extend({}, colorOptions, {
            renderCallback: function($elm, toggled) {
                var colors = this.color.colors;
                strokeColor = '#' + (colors.HEX);
                refreshColor();
            }
        }));

    $('#color_fill_btn')
        .colorPicker($.extend({}, colorOptions, {
            renderCallback: function($elm, toggled) {
                var colors = this.color.colors;
                fillColor = '#' + (colors.HEX);
                refreshColor();
            }
        }));

    $('#background_btn')
        .colorPicker($.extend({}, colorOptions, {
            renderCallback: function($elm, toggled) {
                var colors = this.color.colors;
                bgColor = '#' + (colors.HEX);
                refreshColor();
            }
        }));
    refreshColor();

    widthSlider = $('#width_slider').slider({ value: lineWidth }).data('slider');
    $('#ex1Slider').css('width', '100%');

    $('#width_slider').on('slide', function(slideEvt) {
        $('#show_width_div').css({
            'border-width': slideEvt.value + 'px'
        });
    });
    $('#borderSettingModal').on('shown.bs.modal show.bs.modal', function(e) {

        $('#ex1Slider').css('width', '100%');
        $('#width_slider').data('slider').setValue(lineWidth);
        $('#show_width_div').css({
            'border-color': strokeColor,
            'width': '100%',
            'height': '80px',
            'background': fillColor,
            'border-width': lineWidth + 'px',
            'border-style': 'solid'
        });

    });


    $('#show_width_div').css({
        'height': lineWidth + 'px'
    });

    $('#submit_width').click(function() {
        changeLineWidth($('#width_slider').val());
        $('#borderSettingModal').modal('hide');
    });

    GameCanvasContext.resizeCanvas();
    $('#color_stroke_btn').css({
        background: strokeColor,
    });
    $('#color_fill_btn').css({
        background: fillColor,
    });
    $('#background_btn').css({
        background: bgColor,
    });

    $(canvasTemp).draggabilly({
        containment: 'body'
    });
    $('#nav_show_switch').bootstrapSwitch()
        .data('bootstrapSwitch').onSwitchChange(function() {
            var show = $(this).data('bootstrapSwitch').state();
            navIsShow = show;
            show ? $(canvasTemp).show() : $(canvasTemp).hide();
        });

        changetool(GameCanvasContext.canvasMode);
}

function bindCanvasEvent() {

    // canvas.removeEventListener('touchstart touchmove touchend mousedown mousemove mouseup', dragHandle);
    // canvas.addEventListener('touchstart touchmove touchend mousedown mousemove mouseup', dragHandle);


    canvas.removeEventListener('touchstart', dragHandle);
    canvas.removeEventListener('touchmove', dragHandle);
    canvas.removeEventListener('touchend', dragHandle);
    canvas.removeEventListener('mousedown', dragHandle);
    canvas.removeEventListener('mousemove', dragHandle);
    canvas.removeEventListener('mouseup', dragHandle);


    canvas.addEventListener('touchstart', dragHandle);
    canvas.addEventListener('touchmove', dragHandle);
    canvas.addEventListener('touchend', dragHandle);
    canvas.addEventListener('mousedown', dragHandle);
    canvas.addEventListener('mousemove', dragHandle);
    canvas.addEventListener('mouseup', dragHandle);



}

function removeCanvasEvent() {

    canvas.removeEventListener('touchstart', dragHandle);
    canvas.removeEventListener('touchmove', dragHandle);
    canvas.removeEventListener('touchend', dragHandle);
    canvas.removeEventListener('mousedown', dragHandle);
    canvas.removeEventListener('mousemove', dragHandle);
    canvas.removeEventListener('mouseup', dragHandle);
}


function openHandMode() {
    GameCanvasContext.cscroll && GameCanvasContext.cscroll.destroy();
    GameCanvasContext.cscroll = new BScroll(document.getElementById('main-canvas-container'), {
        startX: 0,
        startY: 0,
        scrollY: true,
        scrollX: true
    });
}

function closeHandMode() {
    GameCanvasContext.cscroll && GameCanvasContext.cscroll.destroy();
    GameCanvasContext.cscroll = null;
}

function zoomin() {
    c_w *= 0.9;
    c_h *= 0.9;
    GameCanvasContext.centerCanvas(c_w, c_h);
}

function zoomout() {
    c_w *= 1.1;
    c_h *= 1.1;
    GameCanvasContext.centerCanvas(c_w, c_h);
}

function changeCursor(tool_id) {
    switch (tool_id) {
        case 'pencil_btn':
            $(canvas).css('cursor', "url('./images/pencil.png') 2 30,auto");
            break;
        case 'line_btn':
        case 'circle_btn':
        case 'rect_btn':
            $(canvas).css('cursor', 'crosshair');
            break;
        case 'eraser_btn':
        case 'brush_btn':
        default:
            $(canvas).css('cursor', "url('./images/" + tool_id.substr(0, tool_id.length - 4) + ".png') 2 30,auto");
            break;
    }
}


function changetool(tool_id) {
    GameCanvasContext.canvasMode = tool_id;
    switch (tool_id) {
        case 'pencil_btn':
        case 'eraser_btn':
        case 'brush_btn':
        case 'line_btn':
        case 'circle_btn':
        case 'rect_btn':
            break;
    }
    changeCursor(tool_id);
}


function refreshColor() {
    GameCanvasContext.ctx.fillStyle = fillColor;
    GameCanvasContext.ctx.strokeStyle = strokeColor;
    $('#canvas').css('background', bgColor);
}

function changeLineWidth(v) {
    GameCanvasContext.ctx.lineWidth = lineWidth = v;
}

GameCanvasContext.changetool = changetool;

function drawBrush(x, y) {
    ctx.save();
    for (var i = 1; i <= 20; i++) {
        ctx.beginPath();
        ctx.arc(x + 3 * lineWidth * (Math.random() - 0.5), y + 3 * lineWidth * (Math.random() - 0.5), 0.1 * lineWidth * Math.random(), 0, Math.PI * 2, false);
        ctx.fill();
    }

    return ctx.restore();
}



var tempShape = null;

function drawTempShape(canvasMode, sx, sy, ex, ey) {
    if (tempShape == null) {
        saveTempShape();
    } else {
        restoreTempShape();
    }
    drawShape(canvasMode, sx, sy, ex, ey, true);
}

function saveTempShape() {
    tempShape = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreTempShape(isClearTemp) {
    if (tempShape) {
        ctx.putImageData(tempShape, 0, 0);
        if (isClearTemp) {
            tempShape = null;
        }
    }
}

function drawShape(canvasMode, sx, sy, ex, ey, isTemping) {
    if (!isTemping) {
        restoreTempShape(true);
    } else {
        ctx.save();
        ctx.globalAlpha = 0.4;
    }
    switch (canvasMode) {
        case 'line_btn':
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            break;
        case 'circle_btn':
            var r = Math.sqrt((sx - ex) * (sx - ex) + (sy - ey) * (sy - ey));
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2, false);
            ctx.stroke();
            if (fillColor) {
                ctx.fill();
            }
            break;
        case 'rect_btn':
            var width = Math.abs(sx - ex),
                height = Math.abs(sy - ey),
                px = sx > ex ? ex : sx,
                py = sy > ey ? ey : sy;
            ctx.strokeRect(px, py, width, height);
            if (fillColor) {
                ctx.fillRect(px, py, width, height);
            }
            break;
    }

    if (isTemping) {
        ctx.restore();
    }

}
function drawText(str,x,y,width,height,txtStyle) {
  // console.log(str,x,y,width,height);
  // ctx.font="20px Georgia";
  // ctx.fillText(str,x,y,width);
  var lineHeight = /\d+/.exec(txtStyle.lineHeight)[0];


  ctx.font = txtStyle.font;
  ctx.fillStyle = strokeColor;
  canvasTextAutoLine(str,width,x,y,+lineHeight);
  ctx.fillStyle = fillColor;
}


function canvasTextAutoLine(str,width,initX,initY,lineHeight){
    
    // for(let i=0;i<str.length;i++){ 
    //     x+=ctx.measureText(str[i]).width; 
    //     if(x>width){//减去initX,防止边界出现的问题 
    //         y+=lineHeight;
    //         x=0;
    //     } 
    //     ctx.fillText(str.substring(i,i+1),initX+x,initY+y);
    //     // if(i==str.length-1){
    //     //     ctx.fillText(str.substring(lastSubStrIndex,i+1),initX,initY);
    //     // }
    // }
    var y = 0;
    var n = str.length;var i = 0;
    var mstr = "";
    while(true){
      var t= str.substring(i,i+1);
      if(ctx.measureText(mstr).width>width||t==='\n'){
        ctx.fillText(mstr,initX,initY+y);
        y+=lineHeight;
        mstr="";
        t='';
      }
      mstr +=t;
      i++;
      if(i>=n){
        if(mstr !== ""){
          ctx.fillText(mstr,initX,initY+y);
        }
        break;
      }
    }

  }






  $('#save_btn').click(function () {
        download('png');
  });







  function download(type) {
      //设置保存图片的类型
      var imgdata = canvas.toDataURL(type);
      //将mime-type改为image/octet-stream,强制让浏览器下载
      var fixtype = function (type) {
          type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
          var r = type.match(/png|jpeg|bmp|gif/)[0];
          return 'image/' + r;
      }
      imgdata = imgdata.replace(fixtype(type), 'image/octet-stream')
      //将图片保存到本地
      var saveFile = function (data, filename) {
          var link = document.createElement('a');
          link.href = data;
          link.download = filename;
          var event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
          link.dispatchEvent(event);
      }
      var filename = new Date().toLocaleDateString() + '.' + type;
      saveFile(imgdata, filename);
  }



onchange="preImg(this.id,'imgPre');"

$('#open_btn').click(function(){
  $('#imgOne').click();
});

$('#imgOne').change(function () {
  preImg(this.id,'imgPre');
});
        //打开图片
        function preImg(sourceId, targetId) {
            if (typeof FileReader === 'undefined') {
                alert('Your browser does not support FileReader...');
                return;
            }
            var reader = new FileReader();

            reader.onload = function (e) {
                var img = document.getElementById(targetId);
                img.src = this.result;
                img.onload = function () {
                    ctx.drawImage(img, 0, 0);
                }
            }
            reader.readAsDataURL(document.getElementById(sourceId).files[0]);
        }