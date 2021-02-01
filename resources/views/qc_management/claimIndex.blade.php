{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/qc.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/device/upkee-require.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
{{--<input type="hidden" id="material_view" value="/MaterialManagement/materialView">--}}
{{--<input type="hidden" id="material_edit" value="/MaterialManagement/materialEdit">--}}


<div class="div_con_wrapper">
  {{--<div class="actions">--}}
  {{--<button class="button button_action button_check"><i class="fa fa-search-plus"></i>批量检验</button>--}}
  {{--</div>--}}
  <div class="searchItem" id="searchForm">
    <div class="actions">
      <button class="button button_action" id="show_all_time">显示</button>
    </div>
    <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
      <div class="el-item">
        <div class="el-item-show">
          <div class="el-item-align">
            <div class="el-form-item">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">索赔单单号</label>
                <input type="text" id="order_id" class="el-input" placeholder="索赔单单号" value="">
              </div>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">物料编号</label>
                <input type="text" id="MATNR" class="el-input" placeholder="物料编号" value="">
              </div>
            </div>
          </div>
          <ul class="el-item-hide">
            <li>
              <div class="el-form-item" style="width:100%;">
                <div class="el-form-item-div">
                  <label class="el-form-item-label">日期筛选</label>
                  <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                  <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">采购凭证编号</label>
                  <input type="text" id="EBELN" class="el-input" placeholder="采购凭证编号" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">采购凭证的项目编号</label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" id="EBELP" class="el-input" autocomplete="off" placeholder="采购凭证的项目编号" value="">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">销售凭证编号</label>
                  <input type="text" id="VBELP" class="el-input" placeholder="销售凭证编号" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">销售和分销凭证编号</label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" id="VBELN" class="el-input" autocomplete="off" placeholder="销售和分销凭证编号" value="">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">生产单号</label>
                  <input type="text" id="po_number" class="el-input" placeholder="生产单号" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">工单号</label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" id="wo_number" class="el-input" autocomplete="off" placeholder="工单号" value="">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">供应商名称</label>
                  <input type="text" id="NAME1" class="el-input" placeholder="供应商名称" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">供应商编码</label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" id="LIFNR" class="el-input" autocomplete="off" placeholder="供应商编码" value="">
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">工序</label>
                  <input type="text" id="operation_name" class="el-input" placeholder="工序" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">创建人卡号</label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" id="card_id" class="el-input" autocomplete="off" placeholder="创建人卡号" value="">
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
            <button type="button" class="el-button el-button--primary submit">搜索</button>
            <button type="button" class="el-button reset">重置</button>
            <a id="exportBtn" style="margin-left:10px;"><button type="button" class="el-button export">导出</button></a>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="table_page">
    <div class="wrap_table_div">
      <table id="table_attr_table" class="sticky uniquetable commontable">
        <thead>
          <tr>
            <th>
              <div class="el-sort">
                索赔单单号
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                工序
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                生产单号
              </div>
            </th>
            <th>
              <div class="el-sort">
                工单号
              </div>
            </th>
            <th>
              <div class="el-sort">
                物料编号
              </div>
            </th>
            <th>
              <div class="el-sort">
                采购凭证编号
              </div>
            </th>
            <th>
              <div class="el-sort">
                采购凭证的项目编号
              </div>
            </th>
            <th>
              <div class="el-sort">
                销售凭证项目
              </div>
            </th>
            <th>
              <div class="el-sort">
                分销和销售凭证编号
              </div>
            </th>
            <th>
              <div class="el-sort">
                供应商名称
              </div>
            </th>
            <th>
              <div class="el-sort">
                供应商编码
              </div>
            </th>
            <th>
              <div class="el-sort">
                问题描述
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                不良项目
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                处理方式
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                失效项目
              </div>
            </th>
            <th class="showtime" style="display: none;">
              <div class="el-sort">
                处理费用
              </div>
            </th>
            <th>
              <div class="el-sort">
                责任归属
              </div>
            </th>
            <th>
              <div class="el-sort">
                统计部门
              </div>
            </th>
            <th>
              <div class="el-sort">
                创建人卡号
              </div>
            </th>
            <th>
              <div class="el-sort">
                创建时间
              </div>
            </th>
            <th class="right">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="table_tbody" style="table-layout:fixed"></tbody>
      </table>
    </div>
    <div id="printList" style="display:none;"></div>
    <div id="pagenation" class="pagenation bottom-page"></div>
  </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/qc_inspection/claim.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>

@endsection