{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css">
<link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css" media="all">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<input type="hidden" id="editurl" value="/ImageManagement/updateImage">
<input type="hidden" id="addurl" value="/ImageManagement/addImage">
<div class="imgs-wrap">
	<div class="tap-btn-wrap">
		<div class="el-tap-wrap edit">
			<span data-item="addImage" class="el-tap active">样册号管理</span>
		</div>
		<div class="el-form-item btnShow msaveBtn">
			<div class="el-form-item-div btn-group">
				<button type="button" class="el-button el-button--primary submit edit none">保存</button>
				<button type="button" class="layui-btn layui-btn-normal layui-btn-sm submit add" style="font-size:14px;margin-top:-6px;">添加</button>
			</div>
		</div>
	</div>
	<div class="el-panel-wrap" style="margin-top: 20px;">
		<div class="el-panel addSampleNumber active">
			<form id="addSampleNumber" class="formMateriel formTemplate normal">
				<div class="flex-wrap">
					<div class="basic-wrap" style="width: 500px;">
						<div class="el-form-item select_type">
							<div class="el-form-item-div">
								<label class="el-form-item-label">类型<span class="mustItem">*</span></label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="--请选择--">
										<input type="hidden" class="val_id" id="parent_id" value="">
									</div>
									<div class="el-select-dropdown">
										<ul class="el-select-dropdown-list">
											<li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
										</ul>
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 100px;"></p>
						</div>
						<!-- <div class="el-form-item select_code">
              <div class="el-form-item-div">
                <label class="el-form-item-label">编码前缀<span class="mustItem">*</span></label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                    <input type="hidden" class="val_id" id="parent_code_id" value="">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                      <li data-id="" class="el-select-dropdown-item kong">--请选择--</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p class="errorMessage" style="padding-left: 100px;"></p>
            </div> -->
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">编码<span class="mustItem">*</span></label>
								<input type="text" id="code" data-name="编码" class="el-input" placeholder="请输入编码" value="">
								<input type="hidden" id="parent_code_id" value="">
							</div>
							<p class="errorMessage codeMessage" style="padding-left: 100px;display: block;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">名称<span class="mustItem">*</span></label>
								<input type="text" id="name" data-name="名称" class="el-input" placeholder="请输入名称" value="">
							</div>
							<p class="errorMessage" style="padding-left: 100px;display: block;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">状态</label>
								<div class="el-select-dropdown-wrap">
									<div class="el-select">
										<i class="el-input-icon el-icon el-icon-caret-top"></i>
										<input type="text" readonly="readonly" class="el-input" value="选择状态">
										<input type="hidden" class="val_id" id="status" value="0">
									</div>
									<div class="el-select-dropdown">
										<ul class="el-select-dropdown-list">
											<li data-id="0" class=" el-select-dropdown-item">停用</li>
											<li data-id="1" class=" el-select-dropdown-item">使用</li>
										</ul>
									</div>
								</div>
							</div>
							<p class="errorMessage" style="padding-left: 100px;display: block;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">颜色</label>
								<input type="text" id="color" data-name="颜色" class="el-input" placeholder="请输入颜色" value="">
							</div>
							<p class="errorMessage" style="padding-left: 100px;display: block;"></p>
						</div>
						<div class="el-form-item">
							<div class="el-form-item-div">
								<label class="el-form-item-label">上传图片</label>
								<div class="kv-avatar">
									<div class="file-loading">
										<input id="avatar-2" name="file" type="file" required data-preview-file-type="image">
									</div>
								</div>
								<div id="kv-avatar-errors-2" class="center-block" style="width:800px;display:none"></div>
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js"></script>
<script src="/statics/custom/js/custom-config.js"></script>
<script src="/statics/custom/js/ajax-public.js"></script>
<script src="/statics/common/fileinput/fileinput.js"></script>
<script src="/statics/common/fileinput/theme/theme.js"></script>
<script src="/statics/common/fileinput/locales/zh.js"></script>
<script src="/statics/common/pagenation/pagenation.js"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>
<script src="/statics/custom/js/sampleNumber/addSampleNumber.js?v={{$release}}"></script>
<script src="/statics/custom/js/sampleNumber/sample-url.js?v={{$release}}"></script>
@endsection