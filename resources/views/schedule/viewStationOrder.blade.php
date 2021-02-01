{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/gantt/Gantt.css?v={{$release}}" />
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <input type="hidden" id="order_view" value="/ProductOrder/productOrderView">
    <input type="hidden" id="order_edit" value="/ProductOrder/productOrderEdit">
    <input type="hidden" id="order_released" value="/ProductOrder/productOrderReleasedView">
    <input id="showAdminName" type="hidden" value="{{ !empty(session('administrator')->cn_name)? session('administrator')->cn_name : session('administrator')->name }}">
    <div class="div_con_wrapper" id="content_wrap">
        <div class="el-panel-wrap" style="margin-top:20px;">
          <div class="searchItem" id="searchForm">
              <form class="searchMAttr searchModal formModal" id="searchReleased_from">
                  <div class="el-item">
                      <div class="el-item-show">
                          <div class="el-item-align">
                          <div class="el-form-item operation_name">
                                  <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">工序</label>
                                    <div class="el-select-dropdown-wrap">
                                      <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="operation_name" class="el-input" placeholder="--请选择--">
                                        <input type="hidden" class="val_id" id="operation_id" value="">
                                      </div>
                                      <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list" id="select-operation">
                                          <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="el-form-item work_center_name">
                                  <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">工作中心</label>
                                    <div class="el-select-dropdown-wrap">
                                      <div class="el-select">
                                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                        <input type="text" readonly="readonly" id="work_center_name" class="el-input" placeholder="--请选择--">
                                        <input type="hidden" class="val_id" id="work_center_id" value="">
                                      </div>
                                      <div class="el-select-dropdown">
                                        <ul class="el-select-dropdown-list" id="select-work-center">
                                          <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            <ul class="el-item-hide">
                              <li>
                              <div class="el-form-item work-start-time">
                                  <div class="el-form-item-div">
                                      <label class="el-form-item-label" style="width: 100px;">排单日期</label>
                                      <input type="text" style="background-color: #fff !important;" id="start_time" readonly class="el-input" placeholder="请选择排单日期" value="">
                                  </div>
                                  <p class="errorMessage" style="padding-left: 100px; display: none;">请选择排单日期</p>
                              </div>
                              </li>
                            </ul>
                      </div>
                      <div class="el-form-item">
                          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                              <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                              <button type="button" class="el-button el-button--primary submit searchWo-submit">搜索</button>
                              <button type="button" class="el-button reset">重置</button>
                              <button type="button" id="toggleFullScreen" class="el-button toggleFullScreen">点我全屏</button>
                          </div>
                      </div>
                  </div>
              </form>
          </div>
        </div>
        <div id="GanttWrap" class="layui-layer-content" style="height: 433px;">
          <div class="GanttWrap"><span style="margin-left:100px;">请输入搜索条件后搜索数据！</span></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/schedule/viewStationOrder.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_station_order.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
@endsection