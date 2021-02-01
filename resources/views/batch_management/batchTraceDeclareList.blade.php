{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/product/work_task.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
  <div class="el-panel-wrap" style="margin-top: 20px;">
    <div class="searchItem" id="searchForm">
      <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
              <div class="el-form-item" style="width: 100%;">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 109px;">时间</label>
                  <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                  <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>
                </div>
              </div>
            </div>
            <ul class="el-item-hide">
              <li>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">批次号</label>
                    <input type="text" id="batch" class="el-input" placeholder="请输入批次号" value="">
                  </div>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">工单号</label>
                    <input type="text" id="work_order_code" class="el-input" placeholder="请输入工单号" value="">
                  </div>
                </div>
              </li>
              <li>
                <div class="el-form-item">
                  <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 109px;">物料号</label>
                    <input type="text" id="material_code" class="el-input" placeholder="请输入物料号" value="">
                  </div>
                </div>
                <div class="el-form-item">
                  <div class="el-form-item-div type_dropdown">
                    <label class="el-form-item-label" style="width: 109px;">类别</label>
                    <div class="el-select-dropdown-wrap">
                      <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="type">
                      </div>
                      <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                          <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                          <li data-id="1" data-code="" data-name="绵泡" class=" el-select-dropdown-item">绵泡</li>
                          <li data-id="2" data-code="" data-name="切割绵" class=" el-select-dropdown-item">切割绵</li>
                          <li data-id="3" data-code="" data-name="切割复合绵" class=" el-select-dropdown-item">切割复合绵</li>
                          <li data-id="4" data-code="" data-name="成品" class=" el-select-dropdown-item">成品</li>
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
              <button type="button" class="el-button el-button--primary submit" data-item="Unproduced_from">搜索</button>
              <button type="button" class="el-button reset">重置</button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div class="table_page">
		<div class="wrap_table_div">
			<table class="sticky uniquetable commontable">
				<thead>
					<tr>
						<th>
							<div class="el-sort">
								工单号
							</div>
						</th>
						<th>
							<div class="el-sort">
								物料号
							</div>
						</th>
						<th>
							<div class="el-sort">
								批次
							</div>
						</th>
						<th class="weight">
							<div class="el-sort">
								重量
							</div>
						</th>
						<th class="length">
							<div class="el-sort">
								长度
							</div>
						</th>
            <th class="number" style="display:none;">
							<div class="el-sort">
								切割绵数量
							</div>
						</th>
						<th>
							<div class="el-sort">
								创建时间
							</div>
						</th>
            <th class="operation">
							<div class="el-sort">
								操作
							</div>
						</th>
					</tr>
				</thead>
				<tbody class="table_tbody" style="table-layout:fixed"></tbody>
			</table>
		</div>
		<div id="pagenation" class="pagenation bottom-page"></div>
	</div>
  </div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/batch/batch_url.js?v={{$release}}"></script>
<script src="/statics/custom/js/batch/batchTraceDeclareList.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection