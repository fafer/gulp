/*!
 *  
 * https://www.recmh.com
 *
 * Copyright 2015-2020 fafer
 * Released under the MIT license
 */

!(function () {
    'use strict';
    if(typeof IndoorMap !== 'undefined') return;
    window.IndoorMap = function(options) {
        var _options = {
            container:undefined,
            default_drawer:'canvas',
            base_map:undefined
        };
        $.extend(_options,options);

        function load_base_map() {
            var base_map = $('<div class="ditu"><img style="display: none;"/></div>');
            var img = $('img',base_map);
            img.get(0).onload = function() {
                $(img).show().parent().css({
                    "top": "50%",
                    "left": "50%",
                    "margin-top": -$(this).parent().outerHeight() / 2 + 'px',
                    "margin-left": -$(this).parent().outerWidth() / 2 + 'px'
                });
            };
            _options.container = $(_options.container);
            img.attr('src',_options.base_map);
            _options.base_map = base_map;
            _options.container.append(base_map);
        }

        return {
            config:_options,
            init:function() {
                if(_options.initial) return this;
                _options.initial = true;
                load_base_map.call();
                this.toucher = Toucher(this);
                return this;
            },
            zoomIn:function() {
                this.toucher.zoomIn();
            },
            zoomOut:function() {
                this.toucher.zoomOut();
            }
        }.init();
    };

    function Transform(dom) {
        var TRANSFORM = ['-webkit-transform','-moz-transform','-ms-transform','-o-transform','transform'],
            TRANSITION = ['-webkit-transition','-moz-transition','-ms-transition','-o-transition','transition'];
        var _scale = 1,_translate_x = 0,_translate_y = 0,dx_scale = 0.2,min_scale = 0.2,max_scale = 3;
        function doTransform() {
            if(_scale < min_scale) _scale = min_scale;
            else if(_scale > max_scale) _scale = max_scale;
            var transfor_str = 'scale('+_scale+') '+'translate('+_translate_x+'px,'+_translate_y+'px)';
            TRANSFORM.forEach(function(d) {
                $(dom).css(d,transfor_str);
            });
        }

        return {
            init:function() {
                $(dom).data('transform',this);
                return this;
            },
            translate:function(x,y) {
                if(x) _translate_x = x;
                if(y) _translate_y = y;
                doTransform(dom);
                return this;
            },
            getCoordinate_vector:function(vector) {
                return {
                    x:vector.dx / _scale,
                    y:vector.dy / _scale
                }
            },
            translate_vector:function(vector) {
                _translate_x += vector.dx / _scale;
                _translate_y += vector.dy / _scale;
                doTransform(dom);
                return this;
            },
            scale:function(scale) {
                _scale = scale;
                doTransform(dom);
                return this;
            },
            scale_vector:function(vector) {
                _scale *= vector;
                doTransform(dom);
                return this;
            },
            zoomOut:function() {
                _scale += dx_scale;
                doTransform(dom);
                return this;
            },
            zoomIn:function() {
                _scale -= dx_scale;
                doTransform(dom);
                return this;
            }
        }.init();
    }

    function Toucher(map) {
        var _zoomDistStart = 0, _zoomDistEnd = 0;
        var _zoomScale = 1;
        var startPoint = {x:0,y:0},
            endPoint = {x:0,y:0};
        var STATE = {NONE: -1, ZOOM: 1, PAN: 2,SELECT:3};
        var _state = STATE.NONE;
        var _panVector = {dx:0,dy:0};
        var transform = Transform(map.config.base_map);
        var drawer = Drawer(map.config.base_map,map.config.default_drawer);
        var enable = false;

        function select(e) {
            $('#s').html(JSON.stringify(startPoint),JSON.stringify(endPoint));
            var target = $(e.target);
            if(target.hasClass('zoom-out')) {
                transform.zoomOut();
                return;
            } else if(target.hasClass('zoom-in')) {
                transform.zoomIn();
                return;
            } else if(target.hasClass('ditu') || target.parents('.ditu').length !== 0) {
                var vector = map_util.getVector(map_util.getCoordinate(map.config.base_map),endPoint);
                vector = transform.getCoordinate_vector(vector);
                $('#s').html('img:'+JSON.stringify(vector));
                var paths = [
                    vector,
                    {
                        x:vector.x+50,
                        y:vector.y
                    },
                    {
                        x:vector.x+75,
                        y:vector.y+25
                    },
                    {
                        x:vector.x+50,
                        y:vector.y+50
                    },
                    {
                        x:vector.x,
                        y:vector.y+50
                    },
                    {
                        x:vector.x-25,
                        y:vector.y+25
                    }
                ];
//                drawer.rect(vector.x,vector.y,100,100);
                drawer.polygon(paths);
            } else {
                drawer.clear();
            }
        }

        function moveEnd(e) {
            $('#s').html(JSON.stringify(_panVector));
        }

        function zoomEnd(e) {
            $('#s').html(_zoomScale);
        }

        function mouseDown(e) {
            enable = true;
            startPoint = endPoint = map_util.getEventCoordinate(e);
            _state = STATE.SELECT;
        }

        function mouseMove(e) {
            if(enable === false) return;
            endPoint = map_util.getEventCoordinate(e);
            _panVector = map_util.getVector(startPoint,endPoint);
            startPoint = endPoint;
            if(_panVector.dx == _panVector.dy) return;
            _state = STATE.PAN;
            transform.translate_vector(_panVector);
        }

        function mouseUp(e) {
            if(enable === false) return;
            enable = false;
            if(_state === STATE.SELECT) {
                select(e);
            } else if(_state === STATE.PAN) {
                moveEnd(e);
            }
            _state = STATE.NONE;
        }

        function touchStart(e) {
            enable = true;
            var touch_coordinate = map_util.getTouchCoordinate(e);
            if(touch_coordinate.length === 1) {
                startPoint = endPoint = touch_coordinate.points[0];
                _state = STATE.SELECT;
            } else if(touch_coordinate.length === 2){
                _zoomDistStart = _zoomDistEnd = touch_coordinate.distance;
            } else{
                _state = STATE.NONE;
                return;
            }
        }

        function touchMove(e) {
            if(enable === false) return;
            var touch_coordinate = map_util.getTouchCoordinate(e);
            if(touch_coordinate.length === 1) {
                endPoint = touch_coordinate.points[0];
                _panVector = map_util.getVector(startPoint,endPoint);
                startPoint = endPoint;
                _state = STATE.PAN;
                transform.translate_vector(_panVector);
            } else if(touch_coordinate.length === 2){
                _zoomDistEnd = touch_coordinate.distance;
                _zoomScale = _zoomDistEnd / _zoomDistStart;
                _zoomDistStart = _zoomDistEnd;
                transform.scale_vector(_zoomScale);
                _state = STATE.ZOOM;
            }
        }

        function touchEnd(e) {
            if(enable === false) return;
            enable = false;
            if(_state === STATE.SELECT) {
                select(e);
            } else if(_state === STATE.PAN) {
                moveEnd(e);
            } else if(_state == STATE.ZOOM) {
                zoomEnd(e);
            }
            _state = STATE.NONE;
        }

        return {
            init:function() {
                var _this = this;
                var dom = map.config.container.get(0);
                map_util.on('mousedown',dom,function(e){
                    mouseDown(e);
                    e.preventDefault();
                }).on('mousemove',dom,function(e) {
                    mouseMove(e);
                    e.preventDefault();
                }).on('mouseup',dom,function(e) {
                    mouseUp(e);
                    e.preventDefault();
                }).on('touchstart',dom,function(e) {
                    touchStart(e);
                    e.preventDefault();
                }).on('touchmove',dom,function(e) {
                    touchMove(e);
                    e.preventDefault();
                    e.stopPropagation();
                }).on('touchend',dom,function(e) {
                    touchEnd(e);
                    e.preventDefault();
                }).on('wheel',dom,function(){
                    _this.zoomOut();
                },function() {
                    _this.zoomIn();
                });
                return this;
            },
            zoomOut:function() {
                transform.zoomOut();
                return this;
            },
            zoomIn:function() {
                transform.zoomIn();
                return this;
            }
        }.init();
    }

    function Drawer(dom,type) {
        var drawer_type = type || 'canvas';
        var layers = [];
        var canvas_drawer,svg_drawer;

        function createCanvasDrawer() {
            var canvas = $('<canvas class="layer"></canvas>');
            var width = $(dom).width();
            var height = $(dom).height();
            $(dom).append(canvas);
            canvas.attr('width',width).attr('height',height);
            return {
                canvas:canvas,
                ctx:canvas.get(0).getContext('2d'),
                clear:function() {
                    this.ctx.clearRect(0,0,width,height);
                },
                rect:function(x,y,w,h) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle="blue";
                    this.ctx.rect(x,y,w,h);
                    this.ctx.stroke();
                },
                polygon:function(paths) {
                    this.clear();
                    this.ctx.fillStyle = "rgba(216,153,44,0.5)";
                    this.ctx.beginPath();
                    this.ctx.moveTo(paths[0].x,paths[0].y);
                    for(var index=1;index<paths.length;index++) {
                        var temp = paths[index];
                        this.ctx.lineTo(temp.x,temp.y);
                    }
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            };
        }

        function createSvgDrawer() {
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns,'svg');
            var width = $(dom).width();
            var height = $(dom).height();
            $(svg).attr('class','layer').attr('width',width).attr('height',height).attr('version','1.1').attr('xmlns',xmlns);
            $(dom).append($(svg));
            return {
                svg:$(svg),
                clear:function() {
                    this.svg.find('path').remove();
                },
                polygon:function(paths) {
                    this.clear();
                    var _path = [];
                    for(var index=0;index<paths.length;index++) {
                        if(index === 0) {
                            _path.push('M'+paths[0].x);
                            _path.push(paths[0].y);
                        } else {
                            _path.push('L'+paths[index].x);
                            _path.push(paths[index].y);
                        }
                    }
                    _path.push('Z');
                    _path = _path.join(' ');
                    var path = $(document.createElementNS(xmlns,'path'));
                    path.attr('d',_path);
                    this.svg.append(path);
                }
            };
        }

        function init_drawer() {
            if(drawer_type === "canvas") {
                if(!canvas_drawer) {
                    canvas_drawer = createCanvasDrawer();
                }
            } else {
                if(!svg_drawer) {
                    svg_drawer = createSvgDrawer();
                }
            }
        }

        return {
            rect:function(x,y,w,h) {
                init_drawer();
                if(drawer_type === "canvas") {
                    canvas_drawer.rect(x,y,w,h);
                }
            },
            clear:function() {
                if(drawer_type === "canvas") {
                    canvas_drawer.clear();
                } else {
                    svg_drawer.clear();
                }
            },
            polygon:function(paths) {
                init_drawer();
                if(drawer_type === "canvas") {
                    canvas_drawer.polygon(paths);
                } else {
                    svg_drawer.polygon(paths);
                }
            },
            init:function() {
                $(dom).data('drawer',this);
                return this;
            }
        }.init();
    }

    var map_util = {
        getCoordinate:function(dom) {
            var offset = $(dom).offset();
            return {x:offset.left,y:offset.top};
        },
        getEventCoordinate:function(event) {
            var evt = event || window.event;
            return {x:evt.clientX + $(window).scrollLeft(),y:evt.clientY+$(window).scrollTop()};
        },
        getTouchCoordinate:function(event) {
            var evt = event || window.event;
            var touches = evt.touches;

            if(touches.length === 1) {
                return {
                    points:[
                        {
                            x:touches[0].clientX,
                            y:touches[0].clientY
                        }
                    ],
                    length:1
                };
            } else if(touches.length === 2) {
                var dx = touches[1].clientX - touches[0].clientX,
                    dy = touches[1].clientY - touches[0].clientY;
                return {
                    points:[
                        {
                            x:touches[0].clientX,
                            y:touches[0].clientY
                        },
                        {
                            x:touches[1].clientX,
                            y:touches[1].clientY
                        }
                    ],
                    length:2,
                    distance:Math.sqrt( dx * dx + dy * dy )
                };
            }
            return [];
        },
        getVector:function(src_coordinate,dest_coordinate) {
            return {
                dx:dest_coordinate.x - src_coordinate.x,
                dy:dest_coordinate.y - src_coordinate.y
            }
        },
        get_Vector:function(vector1,vector2) {
            return {
                dx:vector2.dx - vector1.dx,
                dy:vector2.dy - vector1.dy
            };
        },
        eventType:{
            wheel:function() {
                return map_util.addMouseWheel;
            },
            mousedown:function() {
                return map_util.addMouseDown;
            },
            mousemove:function() {
                return map_util.addMouseMove;
            },
            mouseup:function() {
                return map_util.addMouseUp;
            },
            touchstart:function() {
                return map_util.addTouchStart;
            },
            touchmove:function() {
                return map_util.addTouchMove;
            },
            touchend:function(){
                return map_util.addTouchEnd;
            }
        },
        addMouseWheel:function(dom,up,down) {
            if(document.addEventListener){
                dom.addEventListener('mousewheel',_mouseWheel,false);
                dom.addEventListener('DOMMouseScroll',_mouseWheel,false);//火狐
            } else if(document.attachEvent) {
                dom.attachEvent('onmousewheel',_mouseWheel);
            }
            var _this = this;
            function _mouseWheel(e) {
                _this.mouseWheel.call(_this,e,up,down);
            }
        },
        mouseWheel:function(e,up,down) {
            e = e || window.event;
            var result = 0;//1向上滚，-1向下滚
            if(e.wheelDelta){//IE/Opera/Chrome值为120，-120，正数向上滚，负数向下滚
                if(e.wheelDelta === 120) result = 1;
                else result = -1;
            } else if(e.detail) {//Firefox 值为3，-3，负数向上滚，正数数向下滚
                if(e.detail === -3) result = 1;
                else result = -1;
            }
            if(result === 1) {
                if(typeof up === 'function') up();
            } else if(result === -1) {
                if(typeof down === 'function') down();
            }
        },
        addMouseDown:function(dom,mouseDown) {
            this.__addListener(dom,'mousedown',mouseDown);
        },
        addMouseMove:function(dom,mouseMove) {
            this.__addListener(dom,'mousemove',mouseMove);
        },
        addMouseUp:function(dom,mouseUp) {
            this.__addListener(dom,'mouseup',mouseUp);
        },
        addTouchStart:function(dom,touchStart) {
            this.__addListener(dom,'touchstart',touchStart);
        },
        addTouchMove:function(dom,touchMove) {
            this.__addListener(dom,'touchmove',touchMove);
        },
        addTouchEnd:function(dom,touchEnd) {
            this.__addListener(dom,'touchend',touchEnd);
        },
        __addListener:function(dom,type,callback) {
            if(document.addEventListener){
                dom.addEventListener(type,callback,false);
            } else if(document.attachEvent) {
                dom.attachEvent('on'+type,callback);
            }
        },
        on:function(event_type) {
            var process = this.eventType[event_type];
            if(typeof process !== 'undefined') {
                process().apply(this,Array.prototype.slice.call(arguments, 1));
            }
            return this;
        }
    }

})();

