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
              <div class="el-form-item-div">
                <label class="el-form-item-label">时间筛选</label>
                <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" autocomplete="off" placeholder="开始时间" value=""></span>——
                <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" autocomplete="off" placeholder="结束时间" value=""></span>
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
      <div class="table-body" id="customerComplaintTable" style="overflow-x:auto;"> 
      
      </div>
    </div>
  </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/echarts/echarts.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/complaint/customerComplaint.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/analysis-url.js?v={{$release}}"></script>
@endsection