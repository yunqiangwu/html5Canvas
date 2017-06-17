const WebSocketClient = window.WebSocketClient;

const getQueryParam = function(argName) {
    var result =location.search.match(new RegExp('[?&]' + argName + '=([^=&]+)'));
    return result&&result[1];
}

const webSocket = WebSocketClient.init({
    path: 'ws://' + location.host + '/ws/',
    open: () => {
        var bbid = getQueryParam('bbid');
        if(bbid){
            isEnableBB = true;
            $('#enable_bb').click();
            $('.bb_check_el').hide();
        }
        webSocket.on('action',function (data) {
            GameCanvasContext.action.apply(window,data.concat([true]));
        });
        webSocket.on('draw',function (data) {
            GameCanvasContext.draw.apply(window,data.concat([true]));
        });
    }
});

function connRoom(bbid){
    if (bbid) {
        if(webSocket.bbid){
            disConnRoom(webSocket.bbid);
        }
        webSocket.send(bbid,'conn');
        webSocket.bbid=bbid;



    }
}

function disConnRoom(bbid){
    if (bbid) {
        webSocket.send(bbid,'disconn');
        webSocket.bbid=null;
    }
}

var isEnableBB = false;

var GameCanvasContext = {};
window.GameCanvasContext = GameCanvasContext;

var navIsShow = true;
var canvasContainer = $('.main-canvas-container');
var canvasWrap = $('.canvas-wrap');
var canvas = $('#canvas')[0];
var canvasTemp = $('#canvas-temp')[0];
var ctxTemp = canvasTemp.getContext('2d');
var c_w = 550
var c_h = 400;
var c_img = null;
//刷子参数
var bwidth = 20;
var bpoints = 30;
var pointsize = 0.4;

//撤销参数
var undo_new = null;
var tempMode = null;
var command = null;
var old_command = null;

var a_1 = 1;
var b_1 = 1;
var c_1 = 1;
var d_1 = 1;
var e_1 = 1;
var f_1 = 1;
var g_1 = 0;


/**
  
  pencil 画笔工具


*/
GameCanvasContext.canvasMode = 'pencil_btn';

//$(document).ready(function(){
//  $('#pencil_btn').click(function(){
//  $('#pencilSettingModal').modal('show');
//  });
//});


var historyData = [];
var historyIndex = -1;
var historyMaxIndex = 1000;
var canvas = GameCanvasContext.canvas = canvas;
var ctx = GameCanvasContext.ctx = GameCanvasContext.canvas.getContext('2d');
var bgColor = 'rgba(255,255,255,.3)';
var strokeColor = '#000';
var cTextColor = '#000';
//var cfont =  window.getComputedStyle($('#prev_font')[0]).font;
var cfont = 'normal normal 500 normal 24px / 26.4px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

var fillColor = '#0a0a0a';
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
        'width': (+w) + 80 + 'px',
        'height': (+h) + 80 + 'px'
    });
    $('#canvas').css({
        // 'top': 0 + 'px',
        // 'left': 0 + 'px',
        'width': w + 'px',
        'height': h + 'px'
    });
    GameCanvasContext.cscroll && GameCanvasContext.cscroll.refresh();
};

var startPoint = { x: 0, y: 0 };
var $currentTextel = null;
var textareael = null;
var tempCanvas2 = null;
GameCanvasContext.draw = function(x, y, type, pageX,pageY,fromBroadCast) {
    var isRestore = false;
    var isBoardCast = true;
    try {
        var canvasMode = GameCanvasContext.canvasMode;
        switch (canvasMode) {

            case 'putImg':
                if (type === 'move') {
                    if (!tempCanvas2) {
                        tempCanvas2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    } else {
                        ctx.putImageData(tempCanvas2, 0, 0);
                    }
                    ctx.drawImage(c_img, x, y);
                }
                if (type === 'click') {
                    ctx.putImageData(tempCanvas2, 0, 0);
                    ctx.drawImage(c_img, x, y);
                    GameCanvasContext.action(tempMode, '');
                    tempCanvas2 = null;
                    $('#imgOne').val('');
                }
                return;
                break;
            case 'eraser_btn':
                if (type === 'dragstart' || type === 'drag' || type === 'dragend' || type === 'click') {
                    ctx.clearRect(x - 15, y - 15, 30, 30);
                    if (!(type === 'dragend' || type === 'click')) {
                        return;
                    }
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
                    return ctx.stroke();
                } else if (type === 'dragend') {
                    ctx.closePath();
                } else if (type === 'click') {
                    ctx.save();
                    isRestore = true;
                    ctx.fillStyle = strokeColor;
                    ctx.beginPath();
                    ctx.arc(x, y, ctx.lineWidth + 1, 0, Math.PI * 2, false);
                    ctx.fill();
                } else {
                    return;
                }
                break;
            case 'brush_btn':
                if (type === 'drag') {
                    drawBrush(x, y);
                }
                if (!(type === 'dragend' || type === 'click')) {
                    return;
                }

                break;
            case 'text_btn':
                var isRetrun = true;
                if (type === 'click') {
                    // startPoint = { x: x, y: y };
                    if ($currentTextel) {
                        var text = textareael.val().trim();
                        if (text !== '') {
                            var tx = $currentTextel.position().left;
                            var ty = $currentTextel.position().top;
                            var tx2 = $(canvas).position().left;
                            var ty2 = $(canvas).position().top;
                            tx = tx - tx2 + 5;
                            ty = ty - ty2 + 23;
                            var txtStyle = window.getComputedStyle(textareael[0]);
                            drawText(text, tx, ty, textareael.width(), textareael.height(), txtStyle);
                            isRetrun = false;
                        }
                        $currentTextel.remove();
                        $currentTextel = null;
                    }
                    if ($currentTextel == null) {
                        var canvasOffset = $(canvas).offset();
                        $currentTextel = $('<div class=\'textEl\'><div class=\'handle\'/><div class=\'handle\'/><div class=\'handle\'/><div class=\'handle\'/><div class=\'resizeHandle\' /><textarea /></div>')
                            .appendTo('#main-canvas-container')
                            .draggabilly({ handle: '.handle', containment: '#canvas' })
                            .css({ left: (pageX - canvasOffset.left) + 'px', top: (pageY - canvasOffset.top) + 'px' })
                            .find('textarea')
                            .css('color', cTextColor)
                            .css('font', cfont)
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
                        if (isRetrun) {
                            return;
                        }

                    }
                } else if (type === 'dragend') {
                    // alert(32);
                    return;
                } else if (type === 'drag') {
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


        }
        if (type === 'move') {
            return;
        }

        var cc = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctxTemp.putImageData(cc, 0, 0);
        if (historyIndex <= historyMaxIndex) {
            historyIndex++;
        } else {
            historyData.shift();
        }
        historyData.push(cc);


        $('.historyShow').text('当前操作步数：' + (+historyIndex + 1));



    } catch (e) {
        console.log(e);
    } finally {
        if (isRestore) {
            ctx.restore();
        }
        if(type == 'move'){
            isBoardCast = false;
        }
        if(isBoardCast&&isEnableBB&&!fromBroadCast){
            webSocket.send(Array.prototype.slice.call(arguments),'draw');
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
        type = 'move';

        //      return;
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



    GameCanvasContext.draw(x * (canvas.width / c_w), y * (canvas.height / c_h), type, e.pageX,e.pageY);

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



function action(command, old_command,fromBroadCast) {
    console.log(command, old_command);

    if(isEnableBB&&!fromBroadCast){
        webSocket.send(Array.prototype.slice.call(arguments),'action');
    }

    if (old_command == 'hand_btn' && command != 'hand_btn' && command != 'zoomout_btn' && command != 'zoomin_btn') {
        closeHandMode();
        bindCanvasEvent();
    }
    if (textareael && old_command == 'text_btn' && command != 'text_btn') {
        var text = textareael.val().trim();
        if (text !== '') {
            var tx = $currentTextel.position().left;
            var ty = $currentTextel.position().top;
            var tx2 = $(canvas).position().left;
            var ty2 = $(canvas).position().top;
            tx = tx - tx2 + 5;
            ty = ty - ty2 + 23;
            var txtStyle = window.getComputedStyle(textareael[0]);
            drawText(text, tx, ty, textareael.width(), textareael.height(), txtStyle);
        }
        $currentTextel.remove();
        $currentTextel = null;
        textareael = null;
        ctxTemp.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    }

    switch (command) {
        case 'hand_btn':
            if (old_command == 'hand_btn')
                return;
            changeCursor(command);
            removeCanvasEvent();
            openHandMode();
            break;
        case 'zoomin_btn':
            zoomin();
            return;
        case 'zoomout_btn':
            zoomout();
            return;
        case 'clear_btn':
            GameCanvasContext.clear();
            break;
        case 'undo_btn':

            if (historyIndex >= 1) {
                historyIndex--;
                ctx.putImageData(historyData[historyIndex], 0, 0);
                ctxTemp.putImageData(historyData[historyIndex], 0, 0);
            }

            $('.historyShow').text('"撤销工具"' + '   ' + '当前操作步数：' + (+historyIndex + 1));


            break;
        case 'redo_btn':

            if (historyData.length - 1 >= historyIndex + 1) {
                historyIndex++;
                ctx.putImageData(historyData[historyIndex], 0, 0);
                ctxTemp.putImageData(historyData[historyIndex], 0, 0);
            }
            $('.historyShow').text('"恢复工具"' + '   ' + '当前操作步数：' + (+historyIndex));
            break;
        case 'pencil_btn':
        case 'eraser_btn':
        case 'line_btn':
        case 'circle_btn':
        case 'rect_btn':
            GameCanvasContext.changetool(command);
            break;
        case 'text_btn':
            if (old_command == 'text_btn') {
                $('#fontSettingModal').modal('show');
            }
            GameCanvasContext.changetool(command);
            break;
        case 'color_btn':
            $('#colorSettingModal').modal('show');
            break;

        case 'width_btn':
            $('#borderSettingModal').modal('show');
            break;

        case 'brush_btn':
            if (old_command == 'brush_btn') {
                $('#Brush-size').val(bwidth);
                $('#Brush-points').val(bpoints);
                $('#Brush-interval').val(pointsize);
                $('#brushSettingModal').modal('show');
                return;
            }
            GameCanvasContext.changetool(command);


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



    $('#strokeColorSetting').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        onChange: function(a, b, c) {
            this.data('color', b);
            // console.log(a,b,c);
            // console.log(this);
        }
    });


    $('#fillColorSetting').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        onChange: function(a, b, c) {
            //          $('#prev_font').css('color','#'+b);
            this.data('color', b);
            // console.log(a,b,c);
            // console.log(this);
        }
    });


    $('#backgroundColorSetting').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        onChange: function(a, b, c) {
            this.data('color', b);

        }
    });


    $('#fontColorSetting').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        onChange: function(a, b, c) {
            this.data('color', b);
            $('#prev_font').css('color', '#' + b);

            // console.log(a,b,c);
            // console.log(this);
        }
    });
    // .colorPicker($.extend({}, colorOptions, {
    //     renderCallback: function($elm, toggled) {
    //         var colors = this.color.colors;
    //         bgColor = '#' + (colors.HEX);
    //         refreshColor();
    //     }
    // }));
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

    $('#enable_bb').bootstrapSwitch()
        .data('bootstrapSwitch').onSwitchChange(function() {
            isEnableBB = $(this).data('bootstrapSwitch').state();
            if (isEnableBB) {
                var bbid = getQueryParam('bbid')||(+new Date());
                connRoom(bbid);
                $('#txt_bb_url').val(location.protocol + '//' + location.host + '?bbid=' + (bbid));
                $('.bb_txt_el').show()
            } else {
                $('.bb_txt_el').hide();
            }




        });


    $('#show_width_div').css({
        'height': lineWidth + 'px'
    });

    //设置"大小窗口"中宽度值
    $('#submit_width').click(function() {
        changeLineWidth($('#width_slider').val());
        $('#borderSettingModal').modal('hide');
    });




    $('#submit_color').click(function() {
        // changeLineWidth($('#width_slider').val());
        strokeColor = '#' + $('#strokeColorSetting').data('color');
        fillColor = '#' + $('#fillColorSetting').data('color');
        bgColor = '#' + $('#backgroundColorSetting').data('color');
        refreshColor();
        $('#colorSettingModal').modal('hide');
    });

    $('#submit_canvas_size').click(function() {
        bgColor = '#' + $('#backgroundColorSetting').data('color');
        refreshColor();
    });



    GameCanvasContext.resizeCanvas();


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
            $(canvas).css('cursor', 'url(\'./images/pencil.png\') 18 60,auto');
            break;
        case 'putImg':
            $(canvas).css('cursor', 'auto');
            break;
        case 'line_btn':
        case 'circle_btn':
        case 'rect_btn':
            $(canvas).css('cursor', 'crosshair');
            break;
        case 'eraser_btn':
        case 'brush_btn':
        default:
            $(canvas).css('cursor', 'url(\'./images/' + tool_id.substr(0, tool_id.length - 4) + '.png\') 18 60,auto');
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
    //  textareael && textareael.css('color',cTextColor);
}

function changeLineWidth(v) {
    GameCanvasContext.ctx.lineWidth = lineWidth = v;
}

GameCanvasContext.changetool = changetool;


//刷子工具
function drawBrush(x, y) {


    ctx.save();

    for (var i = 1; i <= bpoints; i++) {
        ctx.beginPath();
        ctx.arc(x + bwidth * lineWidth * (Math.random() - 0.5), y + bwidth * lineWidth * (Math.random() - 0.5), pointsize * lineWidth * Math.random(), 0, Math.PI * 2, false);
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

function drawText(str, x, y, width, height, txtStyle) {
    // console.log(str,x,y,width,height);
    // ctx.font="20px Georgia";
    // ctx.fillText(str,x,y,width);
    var lineHeight = +(/\d+/.exec(txtStyle.lineHeight)[0]);


    ctx.font = txtStyle.font;
    ctx.fillStyle = strokeColor;



    x *= (canvas.width / c_w);
    y *= (canvas.height / c_h);
    width *= (canvas.width / c_w);
    height *= (canvas.height / c_h);
    lineHeight *= (canvas.height / c_h);

    canvasTextAutoLine(str, width, x, y, lineHeight);
    ctx.fillStyle = fillColor;
}


function canvasTextAutoLine(str, width, initX, initY, lineHeight) {

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
    var n = str.length;
    var i = 0;
    var mstr = '';
    ctx.save();
    ctx.fillStyle = cTextColor;
    while (true) {
        var t = str.substring(i, i + 1);
        if (ctx.measureText(mstr).width > width || t === '\n') {
            ctx.fillText(mstr, initX, initY + y);
            y += lineHeight;
            mstr = '';
            t = '';
        }
        mstr += t;
        i++;
        if (i >= n) {
            if (mstr !== '') {
                ctx.fillText(mstr, initX, initY + y);
            }
            break;
        }
    }
    ctx.restore();
}






$('#save_btn').click(function() {
    download('png');
});







function download(type) {
    //设置保存图片的类型
    var imgdata = canvas.toDataURL(type);
    //将mime-type改为image/octet-stream,强制让浏览器下载
    var fixtype = function(type) {
        type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
        var r = type.match(/png|jpeg|bmp|gif/)[0];
        return 'image/' + r;
    }
    imgdata = imgdata.replace(fixtype(type), 'image/octet-stream')
        //将图片保存到本地
    var saveFile = function(data, filename) {
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



onchange = 'preImg(this.id,\'imgPre\');'

$('#open_btn').click(function() {
    $('#imgOne').click();
});

$('#imgOne').change(function() {
    if (!this.value) {
        return;
    }
    preImg(this.id, 'imgPre');
});
//打开图片
function preImg(sourceId, targetId) {
    if (typeof FileReader === 'undefined') {
        alert('Your browser does not support FileReader...');
        return;
    }
    var reader = new FileReader();

    reader.onload = function(e) {
        var img = document.getElementById(targetId);
        img.src = this.result;
        img.onload = function() {

            c_img = img;
            tempMode = GameCanvasContext.canvasMode;
            GameCanvasContext.changetool('putImg');

        }
    }
    reader.readAsDataURL(document.getElementById(sourceId).files[0]);
}


//  #font_settings select,#font_settings input
$('#fontSize,#fontType,#fontBold,#fontItalic,#fontColorSetting').change(function() {
    var prev_font = $('#prev_font');
    switch (this.id) {
        case 'fontSize':
            prev_font.css('font-size', this.value);
            break;
        case 'fontType':
            prev_font.css('font-family', this.value);
            break;
        case 'fontBold':
            prev_font.css('font-weight', $(this).is(':checked') ? 'bolder' : 'normal');
            break;
        case 'fontItalic':
            prev_font.css('font-style', $(this).is(':checked') ? 'italic' : 'normal');
            break;
        case 'fontColorSetting':
            prev_font.css('color', $(this).css('background-color'));
            break;
    }
});



//event
$('#submit_font').click(function() {

    var setstyle = window.getComputedStyle($('#prev_font')[0]);
    var ccolor = setstyle.color;
    cTextColor = ccolor;
    cfont = setstyle.font;
    textareael && textareael.css('color', ccolor);
    textareael && textareael.css('font', cfont);


    refreshColor();

    $('#fontSettingModal').modal('hide');
});


$('#submit_brush').click(function() {
    bwidth = +$('#Brush-size').val();
    bpoints = +$('#Brush-points').val();
    pointsize = +$('#Brush-interval').val();
    $('#brushSettingModal').modal('hide');


});





$('#canvas-size-btn').click(function() {
    $('#canvas-width').val(canvas.width);
    $('#canvas-height').val(canvas.height);
    $('#sizeSettingModal').modal('show');

});


//$('#brush_btn').click(function(){
//  $('#brushSettingModal').modal('show');
//});


$('#submit_canvas_size').click(function(event) {


    var w = document.getElementById('canvas-width').value;
    var h = document.getElementById('canvas-height').value;


    var oldW = c_w;
    var oldH = c_h;


    //
    var temp = ctx.getImageData(0, 0, oldW, oldH);

    //
    c_w = w;
    c_h = h;
    canvas.setAttribute('width', c_w);
    canvas.setAttribute('height', c_h);

    //
    ctx.clearRect(0, 0, c_w, c_h);

    //
    ctx.putImageData(temp, 0, 0);

    //
    resizeCanvas();


    $('#sizeSettingModal').modal('hide');
});
