{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

<input type="hidden" id="workOrder_view" value="/WorkOrder/workOrderView">
<input type="hidden" id="workOrderItem_view" value="/WorkOrder/viewPickingList">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <input id="showAdminName" type="hidden" value="{{ !empty(session('administrator')->cn_name)? session('administrator')->cn_name : session('administrator')->name }}">
    
    <div class="el-panel-wrap" style="margin-top: 20px;">
    <div class="searchItem" id="searchForm">
        <input type="text" id="status" style="display: none;">
        <input type="text" id="pageNnber" style="display: none;" value="1">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">销售订单号</label>
                        <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单号" value="">
                    </div>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: 100px;">工单号</label>
                        <input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
                    </div>
                </div>

            </div>
            <ul class="el-item-hide">
                <li>
                    <div class="el-form-item" style="width: 100%;">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">排入时间</label>
                            <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                            <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                            <input type="text" id="production_order_number" class="el-input" placeholder="请输入生产订单号" value="">
                        </div>
                    </div>
                    <div class="el-form-item select_rank_plan">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">&nbsp;&nbsp;班次</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" placeholder="--请选择--">
                                    <input type="hidden" class="val_id" id="rankplan" value=""/>
                                </div>
                                <div class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="errorMessage" style="padding-left: 100px;"></p>
                    </div>
                </li>
              <li>
                  <div class="el-form-item">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                          <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
                      </div>
                  </div>
                  <div class="el-form-item work_shift_name">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">工位号</label>
                          <input type="text" id="work_shift_name" class="el-input" placeholder="请输入工位号" value="">
                      </div>
                  </div>
              </li>
              <li>
                  <div class="el-form-item work_station_time">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">计划日期</label>
                          <input type="text" style="background-color: #fff !important;" id="work_station_time" readonly class="el-input" placeholder="请输入计划日期" value="">
                      </div>
                  </div>
                  <div class="el-form-item">
                      <div class="el-form-item-div">
                          <label class="el-form-item-label" style="width: 100px;">报工状态</label>
                          <div class="el-select-dropdown-wrap">
                              <div class="el-select schedule">
                                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                  <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                  <input type="hidden" class="val_id" id="schedule" value="">
                              </div>
                              <div class="el-select-dropdown" style="display: none;">
                                  <ul class="el-select-dropdown-list">
                                      <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                      <li data-id="0" class=" el-select-dropdown-item">未开始</li>
                                      <li data-id="1" class=" el-select-dropdown-item">进行中</li>
                                      <li data-id="2" class=" el-select-dropdown-item">已完工</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                  </div>
              </li>
                <li>
                    <div class="el-form-item work_shift_name">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">浪潮销售订单号</label>
                            <input type="text" id="inspur_sales_order_code" class="el-input" placeholder="请输入浪潮销售订单号" value="">
                        </div>
                    </div>
                    <div class="el-form-item work_shift_name">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">浪潮物料号</label>
                            <input type="text" id="inspur_material_code" class="el-input" placeholder="请输入浪潮物料号" value="">
                        </div>
                    </div>
                </li>
                <li>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">领料状态</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select schedule">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="picking_status" value="">
                                </div>
                                <div class="el-select-dropdown" style="display: none;">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                        <li data-id="0" class=" el-select-dropdown-item">未领</li>
                                        <li data-id="1" class=" el-select-dropdown-item">领料中</li>
                                        <li data-id="2" class=" el-select-dropdown-item">已领</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">SAP发料状态</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select schedule">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                    <input type="hidden" class="val_id" id="send_status" value="">
                                </div>
                                <div class="el-select-dropdown" style="display: none;">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class=" el-select-dropdown-item">--请选择--</li>
                                        <li data-id="0" class=" el-select-dropdown-item">未发</li>
                                        <li data-id="1" class=" el-select-dropdown-item">少发</li>
                                        <li data-id="2" class=" el-select-dropdown-item">正常</li>
                                        <li data-id="3" class=" el-select-dropdown-item">超发</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: 100px;">工作任务号</label>
                            <input type="text" id="work_task_number" class="el-input" placeholder="请输入工作任务号" value="">
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="el-form-item">
            <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
                <button type="button" class="el-button reset">重置</button>
                    <button type="button" class="el-button merge-buste">合并报工</button>
            </div>
        </div>
        </div>
    </form>
    </div>
    <div class="table_page">
        
    </div>
    </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/cookie/jquery.cookie.js" type="text/javascript"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/custom/js/product_order/product-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/buste/mergebuste.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
@endsection