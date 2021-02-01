{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <input id="showAdminName" type="hidden" value="{{ !empty(session('administrator')->cn_name)? session('administrator')->cn_name : session('administrator')->name }}">
	<div class="el-panel-wrap">
		<!-- <div class="thinCalendar"> -->
      <div class="searchItem" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchReleased_from">
            <div class="el-item">
              <div class="el-item-show">
                <div class="el-item-align">
                  <div class="el-form-item work_station_time">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 100px;">选择日期</label>
                      <input type="text" style="background-color: #fff !important;width:272px;" id="date" readonly class="el-input" placeholder="请选择日期" value="">
                    </div>
                    <p class="errorMessage" style="padding-left: 100px; display: none;">*请选择日期</p>
                  </div>
                  <div class="el-form-item bench">
                    <div class="el-form-item-div">
                      <label class="el-form-item-label" style="width: 100px;">工位</label>
                      <div class="el-select-dropdown-wrap">
                        <div class="el-select">
                          <i class="el-input-icon el-icon el-icon-caret-top"></i>
                          <input type="text" readonly="readonly" id="workBench" class="el-input" placeholder="--请选择--">
                          <input type="hidden" class="val_id" id="work_bench_id" value="">
                        </div>
                        <div class="el-select-dropdown">
                          <ul class="el-select-dropdown-list" id="select-work-bench">
                          </ul>
                        </div>
                      </div>
                      <p class="errorMessage" style="padding-left: ${labelWidth}px;display:none;"></p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div btn-group" style="height:70px;line-height:70px;">
                  <button type="button" class="el-button el-button--primary submit search">搜索</button>
                </div>
              </div>
            </div>
        </form>
      </div>
			<div class="wrap" style="height:auto;margin-top:20px;display:flex;">
				<div class="gantt-div-wrap" style="width:100%;background:#FAFBFC;border-radius: 3px;box-shadow: #e0e0e0 0px 0px 20px 1px;min-height:580px;">
					<div class="workcenter" style="width:100%;font-size:18px;height:35px;line-height:35px;border-radius: 3px;color: #119BE7;display:flex;background: #F3F3F3;">
						<div><span style="margin-left:10px;">产线生产统计: </span><span id="benchName"></span></div>
            <div style="flex:1;"></div>
            <div style="margin-right:5px;"><button type="button" class="el-button export"><a id='exportExcel'>导出</a></button></div>
					</div>
					<div class="ProductionStatistics" id="ProductionStatistics">
            <div class="wrap_table_div">
              <table class="sticky uniquetable commontable">
                <thead>
                  <tr>
                    <th class="text-center nowrap tight">销售订单号</th>
                    <th class="text-center nowrap tight">工单号</th>
                    <th class="text-center nowrap tight">物料编号</th>
                    <th class="text-center nowrap tight">产成品</th>
                    <th class="text-center nowrap tight">排班数量</th>
                    <th class="text-center nowrap tight">白班</th>
                    <th class="text-center nowrap tight">夜班</th>
                  </tr>
                </thead>
                <tbody class="table_tbody">
                <tr><td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td></tr>
                </tbody>
              </table>
            </div>
          </div>
				</div>
			</div>
	</div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/ace/assets/js/moment.min.js"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/production_statistics.js?v={{$release}}"></script>
@endsection
