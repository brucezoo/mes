{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<!-- <link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/otherinstore.css?v={{$release}}"> -->
<link type="text/css" rel="stylesheet" href="/statics/custom/css/storage/allocate.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="storage_wrap">
	<div class="tap-btn-wrap">
		<div class="el-form-item btnShow saveBtn">
			<div class="el-form-item-div btn-group">
				<button type="button" class="el-button el-button--primary submit save" style="margin-right: 20px;">保存</button>
			</div>
		</div>
	</div>

  <form id="addSBasic_form" class="formTemplate formStorage normal">
    <div class="storage_blockquote">
      <h4>出库单信息</h4>
      <div class="basic_info">
        <div>
          <div class="el-form-item">
            <div class="el-form-item-div">
              <label class="el-form-item-label">出库单编码<span class="mustItem">*</span></label>
              <input type="text" id="code" readonly="readonly" class="el-input" placeholder="请输入编码" value="">
            </div>
            <p class="errorMessage" style="padding-left: 30px;"></p>
          </div>
          <div class="el-form-item cost-center">
            <div class="el-form-item-div">
              <label class="el-form-item-label">成本中心<span class="mustItem">*</span></label>
              <div class="el-select-dropdown-wrap">
                <div class="el-select">
                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                  <input type="text" readonly="readonly" id="costCenter" class="el-input" value="--请选择--">
                </div>
                <div class="el-select-dropdown" style="">
                  <ul class="el-select-dropdown-list">
                    <li data-id="${item.costcenter_id}" class="el-select-dropdown-item">${item.CostCenterShortText}</li>
                  </ul>
                </div>
              </div>
            </div>
            <p class="errorMessage" style="padding-left: 20px;"></p>
          </div>
        </div>
        <div>
          <div class="el-form-item charge">
            <div class="el-form-item-div">
              <label class="el-form-item-label">负责人<span class="mustItem">*</span></label>
              <div class="el-select-dropdown-wrap">
                <input type="text" data-id="" id="personInCharge" class="el-input" autocomplete="off" placeholder="请输入负责人" value="">
                <div class="el-select-dropdown" style="position:absolute;">
                  <ul class="el-select-dropdown-list">
                  </ul>
                </div>
              </div>
            </div>
            <p class="errorMessage"></p>
          </div>
          <div class="el-form-item">
            <div class="el-form-item-div">
              <label class="el-form-item-label">共耗类型<span class="mustItem">*</span></label>
              <div class="el-select-dropdown-wrap">
                <div class="el-select">
                  <i class="el-input-icon el-icon el-icon-caret-top"></i>
                  <input type="text" readonly="readonly" id="consumeType" class="el-input" value="--请选择--">
                  <input type="hidden" class="val_id" id="consumetype_id" value="">
                </div>
                <div class="el-select-dropdown">
                  <ul class="el-select-dropdown-list">
                    <li data-id="1" class="el-select-dropdown-item">共耗</li>
                    <li data-id="2" class="el-select-dropdown-item">共耗冲销</li>
                  </ul>
                </div>
              </div>
            </div>
            <p class="errorMessage"></p>
          </div>
        </div>
        <div>
          <div class="el-form-item">
            <div class="el-form-item-div">
              <label class="el-form-item-label">描述</label>
              <textarea type="textarea" maxlength="500" id="remark" rows="5" class="el-textarea" placeholder="请输入描述，最多只能输入500字"></textarea>
            </div>
            <p class="errorMessage" style="padding-left: 20px;"></p>
          </div>
        </div>
      </div>
    </div>
    <div class="storage_blockquote">
      <h4>明细 <button type="button" id="edit-add-btn" class="storage-button storage-add-item storage-add-new-item">添加明细</button></h4>
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
    </form>
  </div>
</div>

@endsection

@section("inline-bottom")
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-consumption-edit.js?v={{$release}}"></script>
@endsection