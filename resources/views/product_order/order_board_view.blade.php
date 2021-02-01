

{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/taskboard/taskboard.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<script src="/statics/common/vue/vue.js?v={{$release}}"></script>

<div class="div_con_wrapper" id="appss">
    <div>
    <div style="display:none">
        <svg>
            <symbol id="wave">
            <path d="M420,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C514,6.5,518,4.7,528.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H420z"></path>
            <path d="M420,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C326,6.5,322,4.7,311.5,2.7C304.3,1.4,293.6-0.1,280,0c0,0,0,0,0,0v20H420z"></path>
            <path d="M140,20c21.5-0.4,38.8-2.5,51.1-4.5c13.4-2.2,26.5-5.2,27.3-5.4C234,6.5,238,4.7,248.5,2.7c7.1-1.3,17.9-2.8,31.5-2.7c0,0,0,0,0,0v20H140z"></path>
            <path d="M140,20c-21.5-0.4-38.8-2.5-51.1-4.5c-13.4-2.2-26.5-5.2-27.3-5.4C46,6.5,42,4.7,31.5,2.7C24.3,1.4,13.6-0.1,0,0c0,0,0,0,0,0l0,20H140z"></path>
            </symbol>
        </svg>
    </div>
        <div class="task-project">
            <button v-on:click="toggleFullScreen" style="float: right;margin-left:20px;">点我全屏</button>
            <div class="task-title"><span class ="title-font">生产实时看板</span></div>
            <div class="task-time"><span class="data-time" v-text="this.date"></span></div>
        </div>
        <div class="task-table-card">
            <div class="table-header-title">
                <!-- <div v-for = "items in 10 ">工位</div> -->
                <ul class="table-list" v-on:click="getWorkorderDetail">
                    <li>
                        <div>工位</div>
                        <div>工单号</div>
                        <div>当前工序</div>
                        <div>预计开始</div>
                        <div>预计结束</div>
                        <div>完工/计划</div>
                        <div class="progress-box" style="padding:0 20px">
                            <div>达成率</div>
                        </div>
                        <div>状态</div>
                    </li>
                </ul>
            </div>
            <div class="table-body" id="body_board" style="height:auto;">
              <div id="scrollForAnimite">
                <ul class="table-list" v-if="orders.length">
                    <li v-for="item in orders">
                        <div :title="item.workbench_name" class="station"><span v-text="item.workbench_name">工位</span></div>
                        <div class="work-order"><span v-text="item.number">工单号</span></div>
                        <div class="current-process"><span v-text="item.operation_name">当前工序</span></div>
                        <div class="start-time"><span v-text="item.predict_start_time">预计开始</span></div>
                        <div class="expectEnd"><span v-text="item.predict_end_time">预计结束</span></div>
                        <div><span class="work-order" v-if="item.schedule < 100">计划</span><span v-else-if="item.schedule >=100">完工</div>
                        <div class="progress-box">
                            <span class="progress-bar">
                                <span class="progress-autobar" :style="{width: (item.schedule) + '%'}"></span>
                                <span class="number-prencent" v-text="item.schedule+'%'"></span>
                            </span>
                        </div>
                        <div class="order-status"><span v-if="item.schedule ==0">未开始</span><span v-else-if="item.schedule<100">进行中</span><span v-else-if="item.schedule>=100">已完成</span><span v-else>未知</span></div>
                    </li>
                </ul>
                <!-- <ul v-else>
                    <li style="text-align:center;font-size:12px;height:40px;line-height:40px;">暂无数据</li>
                </ul> -->
            </div>
          </div>
        </div>
        <div class="secend-box">
            <div class="task-table-card card-img">
                <div class="table-header-title color-green">作业完成率</div>
                <div class="img-mask">
                    <div class="left-img" v-if="dayShift!=undefined">
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" :style="{transform: 'translate(0,'+(100-dayShift.rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;" v-text="dayShift.rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="left-img" v-else>
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" style="transform: translate(0,100%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-if="nightShift!=undefined">
                        <ul>
                            <li class="sun-img moon"></li>
                            <li style="color:#fff" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  :style="{transform: 'translate(0,'+(100-nightShift.rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05" v-text="nightShift.rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-else>
                        <ul>
                            <li class="sun-img moon"></li>
                            <li style="color:#fff" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  style="transform: translate(0,100%)">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="task-table-card card-img">
                <div class="table-header-title color-green">按时完成率</div>
                <div class="img-mask">
                    <div class="left-img" v-if="dayShift!=undefined">
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" :style="{transform: 'translate(0,'+(100-dayShift.ontime_rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#fff;text-shadow: 0px 0px 8px #FF0000;" v-text="dayShift.ontime_rank_complete_percent+'%'">
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="left-img" v-else>
                        <ul>
                            <li class="sun-img"></li>
                            <li style="color:#333" class="message">白班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water" style="transform: translate(0,100%);">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img"  v-if="nightShift!=undefined" style="background-color:rgb(242, 242, 242)">
                        <ul>
                            <li class="sun-img moon2" ></li>
                            <li style="color:#333" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water blue" id="water"  :style="{transform: 'translate(0,'+(100-nightShift.ontime_rank_complete_percent)+'%)'}">
                                        <svg class="water__wave water__wave_back blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front blue" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#f49c05" v-text="nightShift.ontime_rank_complete_percent+'%'">
                                        35%
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="right-img" v-else style="background-color:rgb(242, 242, 242)">
                        <ul>
                            <li class="sun-img moon2"></li>
                            <li style="color:#333" class="message">晚班</li>
                            <li class="round-precent">
                                <div>
                                    <div class="water" id="water"  style="transform: translate(0,100%)">
                                        <svg class="water__wave water__wave_back" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                        <svg class="water__wave water__wave_front" viewBox="0 0 560 20">
                                            <use xlink:href="#wave"></use>
                                        </svg>
                                    </div>
                                    <span class="prenect-number-round" style="color:#000;font-size:12px;">
                                        暂无数据
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
            <div class="task-table-card card-table">
                <div class="table-header-title color-origin">
                    <ul class="table-list" >
                        <li>
                            <div>工位</div>
                            <div>工单号</div>
                            <div>报警时间</div>
                            <div>报警信息</div>
                            <div>报警状态</div>
                        </li>
                    </ul>
                </div>
                <div class="table-body" >
                    <ul class="table-list" style="text-align:center;height:40px;line-height:40px;">
                       暂无数据
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/vue/axios.min.js"></script>
<script>
    var padDate = function (value) {    //在月份、日期、小时等小于10时在前面补0
        return value<10?'0'+value:value;
    };
    var app = new Vue({
        el: '#appss',
        data: {
            message: 'He',
            date:'',
            orders:{workbench_name: "复合A1号",number: "WO2018110610763",operation_name: "滚胶/喷胶复合",predict_start_time: "00:00:00",predict_end_time: "10:00:00",complete: 0,complete_percent:0,status: 2},
            nightShift:{ontime_rank_complete_percent: 0,rank_complete_percent: 0},
            dayShift:{ontime_rank_complete_percent: 0,rank_complete_percent: 0}
        },
        filters:{   //过滤器

        },
        created: function(){
            this.initWorkorderDetail(),
            this.getWorkorderDetail()
        },
        mounted: function () {  //定时器，用于每秒刷新时间
            var _this = this;   //声明一个变量指向Vue实例this，保证作用域一致
            this.timer = setInterval(function () {
                var date = new Date();    //修改数据date
                var year = date.getFullYear();
                var month = padDate(date.getMonth()+1);
                var day = padDate(date.getDate());
                var hours = padDate(date.getHours());
                var minutes = padDate(date.getMinutes());
                var seconds = padDate(date.getSeconds());
                //整理数据并返回
                _this.date = year+'-'+month+'-'+day+' '+hours+':'+minutes+':'+seconds;
            },1000);
        },
        methods:{
            initWorkorderDetail:function(){
                let url = `/ProductOrder/productBoard`;
                axios.get(url, {
                    params: {
                        _token: "8b5491b17a70e24107c89f37b1036078"
                    }
                }).then(res => {
                    if(res&&res.data.results){
                      console.log("res.data.results"+res.data.results)
                        this.orders=res.data.results.orders;
                        for(var i=0;i<res.data.results.orders.length;i++){
                            this.orders[i].predict_start_time=formatDuring(res.data.results.orders[i].predict_start_time,'H:i:s');
                            this.orders[i].predict_end_time=formatDuring(res.data.results.orders[i].predict_end_time,'H:i:s');
                        }
                        this.nightShift=res.data.results.ranks[2];
                        this.dayShift=res.data.results.ranks[1];
                    }
                })
            },
            //获取工单完成状态
            getWorkorderDetail:function() {
                let url = `/ProductOrder/productBoard`;
                setInterval(() => {
                    axios.get(url, {
                        params: {
                            _token: "8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res => {
                        if(res&&res.data.results){
                            this.orders=res.data.results.orders;
                            for(var i=0;i<res.data.results.orders.length;i++){
                                this.orders[i].predict_start_time=formatDuring(res.data.results.orders[i].predict_start_time,'H:i:s');
                                this.orders[i].predict_end_time=formatDuring(res.data.results.orders[i].predict_end_time,'H:i:s');
                            }
                            this.nightShift=res.data.results.ranks[2];
                            this.dayShift=res.data.results.ranks[1];
                        }
                    })
                }, 10000)
            },
            FullScreen: function (el){
                    var isFullscreen=document.fullScreen||document.mozFullScreen||document.webkitIsFullScreen;
                    if(!isFullscreen){//进入全屏,多重短路表达式
                        (el.requestFullscreen&&el.requestFullscreen())||
                        (el.mozRequestFullScreen&&el.mozRequestFullScreen())||
                        (el.webkitRequestFullscreen&&el.webkitRequestFullscreen())||(el.msRequestFullscreen&&el.msRequestFullscreen());
                        el.style.background="white";

                        //el.style.fontSize="20px";
                        document.getElementById('body_board').style.width = (document.documentElement.clientWidth)+"px";
                        document.getElementById('body_board').style.height = (document.documentElement.clientHeight-300)+"px";
                        var dom = document.getElementsByClassName('showItem')
                        for(var i=0;i<dom.length;i++){
                            dom[i].style.display = 'none';
                        }
                    }else{	//退出全屏,三目运算符
                        document.exitFullscreen?document.exitFullscreen():
                            document.mozCancelFullScreen?document.mozCancelFullScreen():
                                document.webkitExitFullscreen?document.webkitExitFullscreen():'';
//                        el.style.color="#393939";
                        document.getElementById('body_board').style.width = (document.documentElement.clientWidth-270)+"px";
                        document.getElementById('body_board').style.height = "500px";
//                        el.style.fontSize="12px";
                        var dom = document.getElementsByClassName('showItem')
                        for(var i=0;i<dom.length;i++){
                            dom[i].style.display = 'block';
                        }
                    }
                },
                toggleFullScreen:function(e){
                    let ele = document.getElementById('appss');
                    var el=e.srcElement||e.target;//target兼容Firefox
                    el.innerHTML=='点我全屏'?el.innerHTML='退出全屏':el.innerHTML='点我全屏';
                    this.FullScreen(ele);
                }
        },
        beforeDestory:function () { //清除定时器
            if (this.timer){
                clearInterval(this.timer);  //在Vue实例销毁前，清除定时器
            }
        }
    })

    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    function formatDuring(timestamp,formats) {
        // 时间戳转换成指定格式日期
        formats = formats || 'Y-m-d';
        var zero = function (value) {
          if (value < 10) {
            return '0' + value;
          }
          return value;
        };
        var myDate = timestamp ? new Date(timestamp * 1000) : new Date();
        var year = myDate.getFullYear();
        var month = zero(myDate.getMonth() + 1);
        var day = zero(myDate.getDate());

        var hour = zero(myDate.getHours());
        var minite = zero(myDate.getMinutes());
        var second = zero(myDate.getSeconds());

        return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
          return ({
            Y: year,
            m: month,
            d: day,
            H: hour,
            i: minite,
            s: second
          })[matches];
        });
    }

    function _InitScroll(_S1, _S2, _W, _H, _T) {
        return "var marqueesHeight" + _S1 + "=" + _H + ";var stopscroll" + _S1 + "=false;var scrollElem" + _S1 + "=document.getElementById('" + _S1 + "');with(scrollElem" + _S1 + "){style.width=" + _W + ";style.height=marqueesHeight" + _S1 + ";style.overflow='hidden';noWrap=true;}scrollElem" + _S1 + ".onmouseover=new Function('stopscroll" + _S1 + "=true');scrollElem" + _S1 + ".onmouseout=new Function('stopscroll" + _S1 + "=false');var preTop" + _S1 + "=0; var currentTop" + _S1 + "=0; var stoptime" + _S1 + "=0;var leftElem" + _S2 + "=document.getElementById('" + _S2 + "');scrollElem" + _S1 + ".appendChild(leftElem" + _S2 + ".cloneNode(true));setTimeout('init_srolltext" + _S1 + "()'," + _T + ");function init_srolltext" + _S1 + "(){scrollElem" + _S1 + ".scrollTop=0;setInterval('scrollUp" + _S1 + "()',30);}function scrollUp" + _S1 + "(){if(stopscroll" + _S1 + "){return;}currentTop" + _S1 + "+=1;if(currentTop" + _S1 + "==(marqueesHeight" + _S1 + "+1)) {stoptime" + _S1 + "+=1;currentTop" + _S1 + "-=1;if(stoptime" + _S1 + "==" + _T / 50 + ") {currentTop" + _S1 + "=0;stoptime" + _S1 + "=0;}}else{preTop" + _S1 + "=scrollElem" + _S1 + ".scrollTop;scrollElem" + _S1 + ".scrollTop +=1;if(preTop" + _S1 + "==scrollElem" + _S1 + ".scrollTop){scrollElem" + _S1 + ".scrollTop=0;scrollElem" + _S1 + ".scrollTop +=1;}}}";
    }
    var heights = $("#scrollForAnimite").clientHeight-100;
    console.log("heights-------------"+heights);
    eval(_InitScroll("body_board", "scrollForAnimite", heights, 200, 5000));
</script>
<script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
@endsection
