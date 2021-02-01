

{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/taskboard/taskboard_molding.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <script src="/statics/common/vue/vue.js?v={{$release}}"></script>


    <div class="div_con_wrapper"  id="appss">
        <div>
            <button v-on:click="toggleFullScreen" style="float: right">点我全屏</button>
            <div class="task-project">
                <div class="task-workBench" v-on:click="showBench">工位</div>
                <div class="task-title"><span class ="title-font">模塑实时看板</span></div>
                <div class="task-time"><span class="data-time" v-text="this.date"></span></div>
            </div>
            <div class="task-table-card" id="showAll">
                <div class="table-header-title">
                    <ul class="table-list">
                        <li class="task-header">
                            <div class="showItem">销售订单号</div>
                            <div class="work-order">工单号</div>
                            <div class="specification">订单工艺</div>
                            <div class="showItem">计划时间</div>
                            <div>排产</div>
                            <div>上架</div>
                            <div>欠交</div>
                            <div class="showItem">单位</div>
                            <!-- <div class="progress-box" style="padding:0 20px">
                                达成率
                            </div> -->
                            <!-- <div>状态</div> -->
                        </li>
                    </ul>
                </div>
                <div class="table-body" id="body_board">
                    <div id="scrollForAnimite">
                        <ul class="table-list item-table-list" >
                            <li v-for="item in orders">
                                <!-- <div :title="item.workbench_name" class="station"><span v-text="item.workbench_name">工位</span></div> -->
                                <div class="product-order showItem"><span v-text="item.sales_order_code">销售订单号</span></div>
                                <div class="work-order"><span v-text="item.wo_number">工单号</span></div>
                                <div class="specification"><span v-text="item.specification" class="showSpecification">规格</span></div>
                                <div class="plan-time showItem"><span v-text="item.plan_time">计划时间</span></div>
                                <div class="qty"><span v-text="item.qty">排产</span></div>
                                <div class="finish-qty"><span v-text="item.finish_qty">上架</span></div>
                                <div class="owe-qty"><span v-text="item.owe_qty">欠交</span></div>
                                <div class="commercial showItem"><span v-text="item.commercial">单位</span></div>
                                <!-- <div class="progress-box">
                            <span class="progress-bar">
                                <span class="progress-autobar" :style="{width: (item.complete) + '%'}"></span>
                                <span class="number-prencent" v-text="item.complete+'%'"></span>
                            </span>
                                </div> -->
                                <!-- <div class="order-status"><span v-if="item.status ==0" style="color: #FF4E4E;">未开始</span><span v-else-if="item.status==1" style="color: #FFFF43">进行中</span><span v-else-if="item.status==2" style="color: #26e600;">完工</span></div> -->
                            </li>
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
                orders:[],
                workshops:[],
                workcenters:[],
                workbenches:[],
                selectWorkBench:''
            },
            filters:{   //过滤器

            },
            created: function(){
                this.initWorkorderDetail(),
                this.getWorkShop(),
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
                getWorkorderDetail:function () {
                    let url = `/WorkDeclareCount/boardList`;
                    setInterval(() => {
                        var dataInfo = this.selectWorkBench;

                        console.log(dataInfo);

                        axios.get(url, {
                            params: {
                              workbench_id:dataInfo,
                                _token: "8b5491b17a70e24107c89f37b1036078"
                            }
                        }).then(res => {
                            if(res&&res.data.results){
                                this.orders=[];
                                for(var i=0;i<res.data.results.length;i++){
                                    var order = {
                                        workbench_name:tansferNull(res.data.results[i].workbench_name),
                                        wo_number:tansferNull(res.data.results[i].work_order_code),
                                        po_number:tansferNull(res.data.results[i].po_number),
                                        specification : tansferNull(res.data.results[i].material_name),
                                        plan_time : tansferNull(res.data.results[i].date),
                                        qty : Number(res.data.results[i].plan_number).toFixed(0),
                                        finish_qty :Number(res.data.results[i].completed_number).toFixed(0),
                                        owe_qty :Number(res.data.results[i].plan_number-res.data.results[i].completed_number).toFixed(0),
                                        complete : Number((res.data.results[i].completed_number/res.data.results[i].plan_number)*100).toFixed(0),
                                        status : res.data.results[i].status,
                                        commercial : res.data.results[i].commercial
                                    }
                                    this.orders.push(order);
                                }

                            }
                        })
                    }, 5000)
                },
                initWorkorderDetail:function(){
                    let url = `/WorkDeclareCount/boardList`;
                    var dataInfo = this.selectWorkBench;
                    axios.get(url, {
                        params: {
                            workbench_id:dataInfo,
                            _token: "8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res => {
                        if(res&&res.data.results){
                            this.orders=[];
                            for(var i=0;i<res.data.results.length;i++){
                                var order = {
                                    workbench_name:tansferNull(res.data.results[i].workbench_name),
                                    sales_order_code:tansferNull(res.data.results[i].sales_order_code),
                                    wo_number:tansferNull(res.data.results[i].work_order_code),
                                    po_number:tansferNull(res.data.results[i].po_number),
                                    specification : tansferNull(res.data.results[i].material_name),
                                    plan_time : tansferNull(res.data.results[i].date),
                                    qty : Number(res.data.results[i].plan_number).toFixed(0),
                                    finish_qty :Number(res.data.results[i].completed_number).toFixed(0),
                                    owe_qty :Number(res.data.results[i].plan_number-res.data.results[i].completed_number).toFixed(0),
                                    complete : Number((res.data.results[i].completed_number/res.data.results[i].plan_number)*100).toFixed(0),
                                    status : res.data.results[i].status,
                                    commercial : res.data.results[i].commercial
                                }
                                this.orders.push(order);
                            }

                        }
                    })
                },
                getWorkShop:function () {
                    let url = `/Workshop/pageIndex`;
                    axios.get(url, {
                        params: {
                            page_no: 1,
                            page_size: 30,
                            _token: "8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res => {
                        this.workshops=res.data.results;
                    })
                },
                showBench:function () {
                    var workshops = this.workshops;
                    var that = this;
                    var layerModal=layer.open({
                        type: 1,
                        title: "选择台板",
                        offset: '100px',
                        area: ['700px','600px'],
                        shade: 0.1,
                        shadeClose: false,
                        resize: false,
                        content: `<form class="formModal formWorkBench" id="workBench">
                                      <div style="display: flex;border: 1px solid #ccc;margin-bottom: 10px;">
                                          <div style="flex: 4;border: 1px solid #ccc;padding: 3px;margin: 3px;border-radius: 3px;" id="workShopSelect"></div>
                                          <div style="flex: 1;text-align:center;"><span style="display: inline-block;width: 20px;height: 20px;border: 1px solid #ccc;border-radius: 5px;text-align: center;line-height: 20px;position: relative;top:50%;transform:translateY(-50%);">></span></div>
                                          <div style="flex: 4;border: 1px solid #ccc;padding: 3px;margin: 3px;border-radius: 3px;" id="workCenter"></div>
                                          <div style="flex: 1;text-align:center;"><span style="display: inline-block;width: 20px;height: 20px;border: 1px solid #ccc;border-radius: 5px;text-align: center;line-height: 20px;position: relative;top:50%;transform:translateY(-50%);">></span></div>
                                          <div style="flex: 4;border: 1px solid #ccc;padding: 3px;margin: 3px;border-radius: 3px;" id="workBenchShow"></div>

                                      </div>
                                      <div class="el-form-item">
                                        <div class="el-form-item-div btn-group">
                                            <button type="button" class="el-button cancle">取消</button>
                                            <button type="button" class="el-button el-button--primary submit">确定</button>
                                        </div>
                                      </div>
                                    </form>` ,
                        success: function(layero,index){
                            getLayerSelectPosition($(layero));
                            $('body').on('click','.cancle',function (e) {
                                e.stopPropagation();
                                layer.close(layerModal);
                            });
                            var workShopHtml = ''
                            workshops.forEach(function (item) {
                                workShopHtml+=  `<div style="border-radius: 3px;background-color: #cee1e2;margin: 2px;padding: 2px;padding-left: 10px;cursor: pointer;" class="work_shop" data-id="${item.workshop_id}">${item.workshop_name}（${item.code}）</div>`;
                            });
                            $("#workShopSelect").html(workShopHtml);
                            $('body').off('click','.el-button--primary.submit').on('click','.el-button--primary.submit',function (e) {
                                e.stopPropagation();
                                that.initWorkorderDetail();
                                layer.close(layerModal);
                            })

                            $("body").on('click','#workShopSelect .work_shop',function (e) {
                                e.stopPropagation();
                                $(this).css('backgroundColor','#00a0e9');
                                $(this).css('color','white');
                                $(this).siblings().css('backgroundColor','#cee1e2');
                                $(this).siblings().css('color','#393939');
                                that.getWorkCenter($(this).attr('data-id'));
                                $("#workCenter").html('');
                                $("#workBenchSelect").html('');
                            });
                            $("body").off('click','#workCenter .work_center').on('click','#workCenter .work_center',function (e) {
                                e.stopPropagation();
                                $(this).css('backgroundColor','#00a0e9');
                                $(this).css('color','white');
                                $(this).siblings().css('backgroundColor','#cee1e2');
                                $(this).siblings().css('color','#393939');
                                that.getWorkBench($(this).attr('data-id'));
                                // $("#workBench").html('');
                                // var id = $(this).attr('data-id');
                                // if(!$(this).hasClass('is-checked')){
                                //     $(this).addClass('is-checked');
                                //     if(that.selectWorkCenter.indexOf(id)==-1){
                                //         that.selectWorkCenter.push(id);
                                //     }
                                // }else{
                                //     $(this).css('backgroundColor','#cee1e2');
                                //     $(this).css('color','#393939');
                                //     $(this).removeClass('is-checked');
                                //     var index=that.selectWorkCenter.indexOf(id);
                                //     that.selectWorkCenter.splice(index,1);
                                // }

                            });
                            $("body").off('click','#workBench .work_bench').on('click','#workBench .work_bench',function (e) {
                                e.stopPropagation();
                                $(this).css('backgroundColor','#00a0e9');
                                $(this).css('color','white');
                                $(this).siblings().css('backgroundColor','#cee1e2');
                                $(this).siblings().css('color','#393939');
                                var id = $(this).attr('data-id');
                                if(!$(this).hasClass('is-checked')){
                                    $(this).addClass('is-checked');
                                    that.selectWorkBench=id;
                                }else{
                                    $(this).css('backgroundColor','#cee1e2');
                                    $(this).css('color','#393939');
                                    $(this).removeClass('is-checked');
                                    that.selectWorkBench='';
                                }

                            });
                        },
                        end: function(){
                            $('.uniquetable tr.active').removeClass('active');
                        }
                    })
                },
                getWorkCenter:function (id) {
                    let url = `/WorkCenter/select`;
                    axios.get(url, {
                        params: {
                            workshop_id: id,
                            _token: "8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res => {
                        this.workcenters=res.data.results;
                        var workCenterHtml = ''
                        this.workcenters.forEach(function (item) {
                            workCenterHtml+=  `<div style="border-radius: 3px;background-color: #cee1e2;margin: 2px;padding: 2px;padding-left: 10px;cursor: pointer;" class="work_center" data-id="${item.id}">${item.name}</div>`;
                        });
                        $("#workCenter").html(workCenterHtml);
                    })
                },
                getWorkBench:function(id){
                    let url=`/WorkOrder/getWorkbench`;
                    axios.get(url,{
                        params:{
                          workcenter_id:id,
                          _token:"8b5491b17a70e24107c89f37b1036078"
                        }
                    }).then(res=>{
                        console.log(res)
                        this.workbenches=res.data.results;
                        var workBenchHtml=''
                        this.workbenches.forEach(function(item){
                            workBenchHtml+=  `<div style="border-radius: 3px;background-color: #cee1e2;margin: 2px;padding: 2px;padding-left: 10px;cursor: pointer;" class="work_bench" data-id="${item.id}">${item.name}</div>`;
                        });
                        $("#workBenchShow").html(workBenchHtml);
                    })
                },
                FullScreen: function (el){
                    var isFullscreen=document.fullScreen||document.mozFullScreen||document.webkitIsFullScreen;
                    if(!isFullscreen){//进入全屏,多重短路表达式
                        (el.requestFullscreen&&el.requestFullscreen())||
                        (el.mozRequestFullScreen&&el.mozRequestFullScreen())||
                        (el.webkitRequestFullscreen&&el.webkitRequestFullscreen())||(el.msRequestFullscreen&&el.msRequestFullscreen());
//                        el.style.color="white";
//                        el.style.fontSize="20px";
                        document.getElementById('body_board').style.width = (document.documentElement.clientWidth)+"px";
                        document.getElementById('body_board').style.height = (document.documentElement.clientHeight)+"px";
                        var dom = document.getElementsByClassName('showItem')
                        for(var i=0;i<dom.length;i++){
                            dom[i].style.display = 'none';
                        }
                    }else{	//退出全屏,三目运算符
                        document.exitFullscreen?document.exitFullscreen():
                            document.mozCancelFullScreen?document.mozCancelFullScreen():
                                document.webkitExitFullscreen?document.webkitExitFullscreen():'';
//                        el.style.color="#393939";
                        document.getElementById('body_board').style.height = "600px";
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
        });

    </script>
    <script>
        function _InitScroll(_S1, _S2, _W, _H, _T) {
            return "var marqueesHeight" + _S1 + "=" + _H + ";var stopscroll" + _S1 + "=false;var scrollElem" + _S1 + "=document.getElementById('" + _S1 + "');with(scrollElem" + _S1 + "){style.width=" + _W + ";style.height=marqueesHeight" + _S1 + ";style.overflow='hidden';noWrap=true;}scrollElem" + _S1 + ".onmouseover=new Function('stopscroll" + _S1 + "=true');scrollElem" + _S1 + ".onmouseout=new Function('stopscroll" + _S1 + "=false');var preTop" + _S1 + "=0; var currentTop" + _S1 + "=0; var stoptime" + _S1 + "=0;var leftElem" + _S2 + "=document.getElementById('" + _S2 + "');scrollElem" + _S1 + ".appendChild(leftElem" + _S2 + ".cloneNode(true));setTimeout('init_srolltext" + _S1 + "()'," + _T + ");function init_srolltext" + _S1 + "(){scrollElem" + _S1 + ".scrollTop=0;setInterval('scrollUp" + _S1 + "()',30);}function scrollUp" + _S1 + "(){if(stopscroll" + _S1 + "){return;}currentTop" + _S1 + "+=1;if(currentTop" + _S1 + "==(marqueesHeight" + _S1 + "+1)) {stoptime" + _S1 + "+=1;currentTop" + _S1 + "-=1;if(stoptime" + _S1 + "==" + _T / 50 + ") {currentTop" + _S1 + "=0;stoptime" + _S1 + "=0;}}else{preTop" + _S1 + "=scrollElem" + _S1 + ".scrollTop;scrollElem" + _S1 + ".scrollTop +=1;if(preTop" + _S1 + "==scrollElem" + _S1 + ".scrollTop){scrollElem" + _S1 + ".scrollTop=0;scrollElem" + _S1 + ".scrollTop +=1;}}}";
        }
        var heights = $('#scrollForAnimite').clientHeight;
        eval(_InitScroll("body_board", "scrollForAnimite", heights, 222, 2000));

    </script>


    <script src="/statics/custom/js/bom/routing.js?v={{$release}}"></script>
@endsection
