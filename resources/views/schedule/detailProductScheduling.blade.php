{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link rel="stylesheet" href="/statics/common/gantt/Gantt.css?v={{$release}}" />
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routing.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/routingDoc.css?v={{$release}}">
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
    <div class="div_con_wrapper">
        <div class="tap-btn-wrap">
            <div id="status-spans" class="el-tap-wrap edit">
                <span data-status="1" class="el-tap active">未排</span>
                <span data-status="2" class="el-tap">已排</span>
            </div>
        </div>
        <div class="el-panel-wrap" style="margin-top:20px;">
          <div class="searchItem" id="searchForm">
              <form class="searchMAttr searchModal formModal" id="searchReleased_from">
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
                                      <label class="el-form-item-label" style="width: 100px;">销售订单行项号</label>
                                      <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项号" value="">
                                  </div>
                              </div>
                          </div>
                          <ul class="el-item-hide">
                              <li>
                                  <div class="el-form-item work_station_time">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">工序开始时间</label>
                                          <input type="text" style="background-color: #fff !important;" id="operation_start_time" readonly class="el-input" placeholder="请输入开始日期" value="">
                                          <input type="hidden" id="work_station_time" readonly value="">
                                      </div>
                                      <p class="errorMessage" style="padding-left: 100px; display: none;">请选择开始时间</p>
                                  </div>
                                  <div class="el-form-item plan-start-time" style="display: none;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">排入开始时间</label>
                                          <input type="text" style="background-color: #fff !important;" id="plan_start_time" readonly class="el-input" placeholder="请输入排入开始时间" value="">
                                      </div>
                                      <p class="errorMessage" style="padding-left: 100px; display: none;">请选择排入开始时间</p>
                                  </div>
                                  <div class="el-form-item plan-start-time" style="display: none;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">排入结束时间</label>
                                          <input type="text" style="background-color: #fff !important;" id="plan_end_time" readonly class="el-input" placeholder="请输入排入结束时间" value="">
                                      </div>
                                      <p class="errorMessage" style="padding-left: 100px; display: none;">请选择排入结束时间</p>
                                  </div>
                              </li>
                              <li>
                                <div class="el-form-item work_start_time">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">主排开始时间</label>
                                        <input type="text" style="background-color: #fff !important;" id="work_start_time" readonly class="el-input" placeholder="请输入开始日期" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px; display: none;">请选择开始时间</p>
                                </div>
                                <div class="el-form-item work_end_time">
                                    <div class="el-form-item-div">
                                        <label class="el-form-item-label" style="width: 100px;">主排结束日期</label>
                                        <input type="text" style="background-color: #fff !important;" id="work_end_time" readonly class="el-input" placeholder="请输入结束日期" value="">
                                    </div>
                                    <p class="errorMessage" style="padding-left: 100px; display: none;">请选择结束时间</p>
                                </div>
                              </li>
                              <li>
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
                              </li>
                              <li>
                                  <div class="el-form-item">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">生产订单号</label>
                                          <input type="text" id="product_order_number" class="el-input" placeholder="请输入生产订单号" value="">
                                      </div>
                                  </div>
                                  <div class="el-form-item">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">工单号</label>
                                          <input type="text" id="work_order_number" class="el-input" placeholder="请输入工单号" value="">
                                      </div>
                                </div>
                              </li>
                              <li>
                                  <div class="el-form-item work_bench_name" style="display:none;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">工位</label>
                                          <div class="el-select-dropdown-wrap">
                                              <div class="el-select">
                                                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                  <input type="text" readonly="readonly" id="work_bench_name" class="el-input" disabled="disabled" placeholder="--请选择--">
                                                  <input type="hidden" class="val_id" id="work_bench_number" value="">
                                              </div>
                                              <div class="el-select-dropdown">
                                                  <ul class="el-select-dropdown-list" id="select-work-bench">
                                                      <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                                                  </ul>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="el-form-item rank-plan-name" style="display: none;">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">班次</label>
                                          <div class="el-select-dropdown-wrap">
                                              <div class="el-select">
                                                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                                  <input type="text" readonly="readonly" id="rank_plan_name" class="el-input" placeholder="--请选择--">
                                                  <input type="hidden" class="val_id" id="rank_plan_id" value="">
                                              </div>
                                              <div class="el-select-dropdown">
                                                  <ul class="el-select-dropdown-list" id="select-rank-plan">
                                                      <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                                                  </ul>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </li>
                              <li>
                                  <div class="el-form-item">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">产成品</label>
                                          <input type="text" id="ma_item_no" class="el-input" placeholder="请输入产成品" value="">
                                      </div>
                                  </div>
                                  <!-- <div class="el-form-item">
                                      <div class="el-form-item-div">
                                          <label class="el-form-item-label" style="width: 100px;">组件消耗</label>
                                          <input type="text" id="component" class="el-input" placeholder="请输入组件消耗" value="">
                                      </div>
                                  </div> -->
                              </li>
                          </ul>
                      </div>
                      <div class="el-form-item">
                          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                              <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
                              <button type="button" class="el-button el-button--primary submit searchWo-submit">搜索</button>
                              <button type="button" class="el-button reset">重置</button>
                              <button type="button" class="el-button el-button--primary combineRow">组合排入</button>
                              <button type="button" class="el-button export" id="exportBtn" style="display:none;"><a id='exportExcel'>导出</a></button>
                              <button type="button" class="el-button print" id="printBtn" style="display:none;">打印流转卡</button>
                              <button type="button" class="el-button export" id="exportCropBtn" style="display:none;"><a id='exportCropExcel'>导出流转卡</a></button>
                          </div>
                      </div>
                  </div>
              </form>
          </div>
        <div id="print_list" style="display: none;"></div>
          <div class="table_page">
              <div class="wrap_table_div">
                  <table id="product_order_table" class="sticky uniquetable commontable">
                      <thead>
                      <tr>
                          <th>
                              <span class="el-checkbox_input all-inmate-check">
                                  <span class="el-checkbox-outset"></span>
                                  <!-- <span class="el-checkbox__label">全选</span> -->
                              </span>
                          </th>
                          <th></th>
                          <th></th>
                          <th>
                            <div class="el-sort">
                              销售订单号
                              <span class="caret-wrapper">
                                <i data-key="sales_order_code" data-sort="asc" class="sort-caret ascending"></i>
                                <i data-key="sales_order_code" data-sort="desc" class="sort-caret descending"></i>
                              </span>
                            </div>
                          </th>
                          <th>
                            <div class="el-sort">
                              行项号
                              <span class="caret-wrapper">
                                <i data-key="sales_order_project_code" data-sort="asc" class="sort-caret ascending"></i>
                                <i data-key="sales_order_project_code" data-sort="desc" class="sort-caret descending"></i>
                              </span>
                            </div>
                          </th>
                          <th>
                            <div class="el-sort">
                                生产订单号
                                <span class="caret-wrapper">
                                    <i data-key="number" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="number" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                            </div>
                          </th>
                          <th>
                              <div class="el-sort">
                                  工单号
                              </div>
                          </th>
                          <th style="width:300px;" class="text-center">进料</th>
                          <th style="width:200px;">产成品</th>
                          <th class="text-center">数量</th>
                          <th class="text-center">
                              <div class="el-sort">
                                工序
                                <span class="caret-wrapper">
                                    <i data-key="operation_id" data-sort="asc" class="sort-caret ascending"></i>
                                    <i data-key="operation_id" data-sort="desc" class="sort-caret descending"></i>
                                </span>
                              </div>
                          </th>
                          <th class="text-center">工序开始时间</th>
                          <th class="text-center">工序结束时间</th>
                          <th class="text-center">
                              <div class="el-sort">
                                  工作中心
                                  <span class="caret-wrapper">
                                      <i data-key="work_center_id" data-sort="asc" class="sort-caret ascending"></i>
                                      <i data-key="work_center_id" data-sort="desc" class="sort-caret descending"></i>
                                  </span>
                              </div>
                          </th>
                          <th class="text-center" style="display:none;" id="work_bench">工位</th>
                          <th class="text-center">工厂</th>
                          <th class="text-center" style="min-width:85px;">
                            工时
                            <span class="switchTime" data-time="1" style="background: rgb(0, 157, 240);color: rgb(255, 255, 255);height: 16px;line-height: 16px;padding: 0 3px;border-radius: 3px;cursor:pointer;">分</span>
                          </th>
                          <th class="text-center plan_start_time" style="display: none;">
                              <div class="el-sort">
                                  排入时间
                                  <span class="caret-wrapper">
                                      <i data-key="plan_start_time" data-sort="asc" class="sort-caret ascending"></i>
                                      <i data-key="plan_start_time" data-sort="desc" class="sort-caret descending"></i>
                                  </span>
                              </div>
                          </th>
                          <th class="text-center plan_end_time" style="display: none;">结束时间</th>
                          <!-- <th class="text-center">浪潮销售订单号</th> -->
                          <th class="text-center">后道加工商</th>
                          <th class="text-center">BOM版本</th>
                          <th class="text-center">操作</th>
                      </tr>
                      </thead>
                      <tbody class="table_tbody">
                      </tbody>
                  </table>
              </div>
			  <div id="pagenation" class="pagenation bottom-page"></div>
			  <div id="total" style="float:right; display:none;" ></div>
          </div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/ace/assets/js/moment.min.js"></script>
    <script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
    <script src="/statics/custom/js/schedule/aps-url.js?v={{$release}}"></script>
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
    <script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/jsPdf.debug.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/canvg.min.js?v={{$release}}"></script>
    <script src="/statics/custom/js/bom/html2canvas.js?v={{$release}}"></script>
    <script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/technologyRouting.js?v={{$release}}"></script>
    <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
    <script src="/statics/custom/js/schedule/detailProduction.js?v={{$release}}"></script>
    <script type="text/javascript" src="/statics/common/gantt/Gantt_fineLine_layer.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
    <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

@endsection