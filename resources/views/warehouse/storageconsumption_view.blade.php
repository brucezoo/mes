{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bom.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
	<div class="tap-btn-wrap">
	</div>
<form id="addSBasic_form" class="formTemplate formStorage normal">
	<div class="storage_blockquote">
		<h3>出库单信息</h3>
		<div class="basic_info">
			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">出库单编码<span class="mustItem">*</span></label>
						<input type="text" readonly="readonly" id="code" class="el-input" placeholder="请输入编码" value="">
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
				<div class="el-form-item cost-center">
          <div class="el-form-item-div">
            <label class="el-form-item-label">成本中心<span class="mustItem">*</span></label>
            <div class="el-select-dropdown-wrap">
              <div class="el-select">
                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                <input type="text" readonly="readonly" id="costCenter" class="el-input" value="--请选择--">
              </div>
            </div>
          </div>
          <p class="errorMessage" style="padding-left: 20px;"></p>
        </div>
			</div>
			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">负责人<span class="mustItem">*</span></label>
						<input type="text" readonly="readonly" id="personInCharge" class="el-input" placeholder="请输入负责人" value="">
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
        <div class="el-form-item">
          <div class="el-form-item-div">
            <label class="el-form-item-label">共耗类型<span class="mustItem">*</span></label>
            <div class="el-select-dropdown-wrap">
              <div class="el-select">
                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                <input type="text" readonly="readonly" id="consumeType" class="el-input" value="--请选择--">
              </div>
            </div>
          </div>
          <p class="errorMessage"></p>
        </div>
			</div>

			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">库存差异原因<span class="mustItem">*</span></label>
						<div name="" style="display: inline-block;width: 160px;height: 80px;border: 1px solid #ccc;background: #F5F5F5;overflow: auto;" id="stockreason_id" class="stockreason_id"></div>
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
			</div>

			<div>
				<div class="el-form-item">
					<div class="el-form-item-div">
						<label class="el-form-item-label">描述</label>
						<textarea type="textarea" readonly="readonly" maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
					</div>
					<p class="errorMessage" style="padding-left: 20px;"></p>
				</div>
			</div>

		</div>
	</div>

	<div class="storage_blockquote">
		<h3>明细</h3>
		<div class="basic_info">
			<div class="table-container">
				<table class="storage_table item_table">
					<thead>
						<tr>
              <th class="thead">销售订单号</th>
							<th class="thead">销售行项号</th>
							<th class="thead">生产订单号</th>
							<th class="thead">工单号</th>
							<th class="thead">物料编码</th>
							<th class="thead">物料名称</th>
							<th class="thead">单位</th>
							<th class="thead">厂区</th>
							<th class="thead">仓库</th>
							<th class="thead">分区</th>
							<th class="thead">仓位</th>
							<th class="thead">数量</th>
							<th class="thead">简要描述</th>
							<th class="thead">锁状态</th>
							<th class="thead">操作</th>
						</tr>
					</thead>
					<tbody class="t-body">
						<tr>
							<td class="nowrap" colspan="15" style="text-align: center;">暂无数据</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</form>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-consumption-view.js?v={{$release}}"></script>
@endsection

