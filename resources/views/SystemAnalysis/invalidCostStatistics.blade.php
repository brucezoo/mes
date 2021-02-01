{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/systemanalysis/systemanalysis.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <div class="searchItem" id="searchForm">
    <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
      <div class="el-item">
        <div class="el-item-show">
          <div class="el-item-align">
            <div class="el-form-item" style="width:100%;">
              <div class="el-form-item-div" style="width:50%;">
                <label class="el-form-item-label">选择年份</label>
                <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" autocomplete="off" placeholder="开始时间" value=""></span>
              </div>
            </div>
          </div>
          <ul class="el-item-hide">
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div WERKS">
                  <label class="el-form-item-label">工厂</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="WERKS" value="0">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div workshop">
                  <label class="el-form-item-label">责任车间</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="workshop_id">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div harmfulItem">
                  <label class="el-form-item-label">不良项目</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="harmful_item">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            </li>
          </ul>
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
            <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
            <button type="button" class="el-button el-button--primary submit">搜索</button>
            <button type="button" class="el-button reset">重置</button>
            <button type="button" class="el-button export" id="exportBtn"><a id='exportExcel'>导出</a></button>
          </div>
        </div>
      </div>
    </form>
  </div>
  <div class="first-box">
    <div class="task-table-card">
      <div class="table-body">
        <div style="text-align:center;font-size:36px;">
          <span><span id="annualShow"></span>年责任单位失效成本统计表</span>
        </div>
        <div class="wrap_table_div has-border">
          <table id="annualSummaryTable" style="table-layout: fixed;border:1px solid #000 !important;">
            <thead>
              <tr style="text-align:center;">
                <th class="center nowrap tight">部门</th>
                <th class="center nowrap tight">JAN</th>
                <th class="center nowrap tight">FEB</th>
                <th class="center nowrap tight">MAR</th>
                <th class="center nowrap tight">APR</th>
                <th class="center nowrap tight">MAY</th>
                <th class="center nowrap tight">JUN</th>
                <th class="center nowrap tight">JUL</th>
                <th class="center nowrap tight">AUG</th>
                <th class="center nowrap tight">SEP</th>
                <th class="center nowrap tight">OCT</th>
                <th class="center nowrap tight">NOV</th>
                <th class="center nowrap tight">DEC</th>
                <th class="center nowrap tight">SUM</th>
              </tr>
            </thead>
            <tbody class="table_tbody_statistics" style="border:1px solid #000 !important;">
            </tbody>
          </table>
        </div>
      </div>
      <div style="margin:5px;" id="invalidAnalysisTable">
      </div>
    </div>
  </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/echarts/echarts.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/invalidcost/annual.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/analysis-url.js?v={{$release}}"></script>
@endsection