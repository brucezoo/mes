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
            <div class="el-form-item" style="width:50%;">
              <div class="el-form-item-div">
                <label class="el-form-item-label">时间筛选</label>
                <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" autocomplete="off" placeholder="开始时间" value=""></span>
                <input type="hidden" id="input_start_time" autocomplete="off" value="">
                <input type="hidden" id="input_end_time" autocomplete="off" value="">
                <!-- ——
                <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" autocomplete="off" placeholder="结束时间" value=""></span> -->
              </div>
            </div>
          </div>
          <!-- <ul class="el-item-hide">
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div type_dropdown">
                  <label class="el-form-item-label">补料类型</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="type" value="0">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                        <li data-id="1" data-code="" class=" el-select-dropdown-item">生产补料线边仓</li>
                        <li data-id="2" data-code="" class=" el-select-dropdown-item">生产补料SAP</li>
                        <li data-id="3" data-code="" class=" el-select-dropdown-item">生产补料车间</li>
                        <li data-id="4" data-code="" class=" el-select-dropdown-item">委外SAP补料</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul> -->
        </div>
        <div class="el-form-item">
          <div class="el-form-item-div btn-group" style="margin-top: 10px;">
            <!-- <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span> -->
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
      <div class="table-body" id="anomalyAnalysisTable" style="overflow-x:auto;">

      </div>
    </div>
  </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/echarts/echarts.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/anomalyAnalysis/anomalyAnalysis.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/analysis-url.js?v={{$release}}"></script>
@endsection