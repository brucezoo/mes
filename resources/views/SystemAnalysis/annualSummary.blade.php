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
            <!-- <li>
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
              <div class="el-form-item">
                <div class="el-form-item-div department_id">
                  <label class="el-form-item-label">责任部门</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="department_id" value="">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li> -->
            <li>
            <div class="el-form-item">
                <div class="el-form-item-div check_resource">
                  <label class="el-form-item-label">来源</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="check_resource" value="">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                        <li data-id="1" data-code="" class=" el-select-dropdown-item">iqc</li>
                        <li data-id="2" data-code="" class=" el-select-dropdown-item">ipqc</li>
                        <li data-id="3" data-code="" class=" el-select-dropdown-item">oqc</li>
                        <li data-id="4" data-code="" class=" el-select-dropdown-item">ipqc报工</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div WERKS">
                  <label class="el-form-item-label">工厂</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="WERKS" value="">
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
                <div class="el-form-item-div mc">
                  <label class="el-form-item-label">加工方式</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="MC" value="">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                        <li data-id="0" data-code="" data-name="M1" class=" el-select-dropdown-item">M1</li>
                        <li data-id="1" data-code="" data-name="MC" class=" el-select-dropdown-item">MC</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label">MC编码</label>
                  <input type="text" id="NAME1" class="el-input" placeholder="请输入MC编码">
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label">采购仓库编码</label>
                  <input type="text" id="LGFSB" class="el-input" placeholder="请输入采购仓库编码">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label">供应商名称</label>
                  <input type="text" id="LIFNR" class="el-input" placeholder="请输入供应商名称">
                </div>
              </div>
            </li>
            <li>
              <div class="el-form-item">
                <div class="el-form-item-div">
                  <label class="el-form-item-label">工序</label>
                  <!-- <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--"> -->
                      <input type="type" class="el-input" id="operation_name" placeholder="请输入工序名称">
                    <!-- </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list">
                        <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div> -->
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div work-shop">
                  <label class="el-form-item-label">车间</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                      <input type="hidden" class="val_id" id="work_shop_id" value=''>
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
    <div class="task-table-card wrap_table_div">
      <div class="table-body" id="main" style="width:100%;height:400px;">
      </div>
      <div style="margin:5px;" id="annualSummaryTable">
        <!-- <div style="text-align:center;font-size:36px;">
          <span>2019辅料检验汇总列表</span>
        </div>
        <div class="wrap_table_div has-border">
          <table style="table-layout: fixed;border:1px solid #000 !important;">
            <thead>
              <tr style="text-align:center;">
                <th class="center nowrap tight" rowspan="2">目标</th>
                <th class="center nowrap tight" colspan="12">月份达成</th>
                <th class="center nowrap tight" rowspan="2">汇总</th>
              </tr>
              <tr style="text-align:center;">
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
              </tr>
            </thead>
            <tbody class="table_tbody_fineProducted" style="border:1px solid #000 !important;">
              <tr style="text-align:center;">
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
                <td class="has-border" style="font-size: 1.5em;height:56px;"></td>
              </tr>
            </tbody>
          </table>
        </div> -->
      </div>
    </div>

  </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/echarts/echarts.min.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/annual/summary.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/SystemAnalysis/analysis-url.js?v={{$release}}"></script>
@endsection