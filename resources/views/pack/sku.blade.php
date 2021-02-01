{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="layui-upload">
	<button type="button" class="layui-btn layui-btn-normal" id="test8">导入sku表</button>
	<button type="button" class="layui-btn" id="test9">上传</button>
	<button type="button" class="layui-btn layui-btn-primary" id="add">添加</button>
	<button type="button" class="layui-btn layui-btn-primary" id="template"><a href="/OfflinePackage/exportExcel?_token=8b5491b17a70e24107c89f37b1036078">导出模板</a></button>
</div>

<!-- 搜索 -->
<div style="float:right;margin-top:-36px;">
	<div style="width:300px;height:36px;border:1px solid #bbb; cursor: pointer; display:inline-block; color:orange; line-height:36px;" id="sear">
		&nbsp;&nbsp;请点击这里进行搜索！
	</div>
	<button id="find" style="cursor: pointer; width:50px;height:34px;border:1px solid #bbb;margin-left:-4px; position:relative;top:-1px; border-left:0; border-top-left-radius: 0px; border-bottom-left-radius:0px; ">搜索</button>
	<div id="block" style=" display:none;  width:300px; height:220px; border:1px solid #bbb;position:absolute; background:#fff; z-index:6666; ">
		<p style="margin-left:10px; margin-top:12px;">订单号：<input type="text" id="orders" lay-verify="title" autocomplete="off" class="layui-input" style=" display:inline-block; border:0;border-bottom:1px solid #bbb; width:220px;"></p>
		<p style="margin-left:10px; margin-top:12px;">行项目：<input type="text" id="items" lay-verify="title" autocomplete="off" class="layui-input" style=" display:inline-block; border:0;border-bottom:1px solid #bbb; width:220px;"></p>
		<p style="margin-left:10px; margin-top:12px;">物料号：<input type="text" id="codes" lay-verify="title" autocomplete="off" class="layui-input" style=" display:inline-block; border:0;border-bottom:1px solid #bbb; width:220px;"></p>
		<p style="margin-left:10px; margin-top:12px;">SKU&nbsp;&nbsp;&nbsp;&nbsp;：<input type="text" id="skus" lay-verify="title" autocomplete="off" class="layui-input" style=" display:inline-block; border:0;border-bottom:1px solid #bbb; width:220px;"></p>
	</div>
</div>

<div>
	<table class="layui-table">
		<thead>
			<tr>
				<th width="12.5%">订单号</th>
				<th width="12.5%">行项目</th>
				<th width="12.5%">物料号</th>
				<th width="12.5%">SKU</th>
				<th width="12.5%">数量</th>
				<th width="12.5%">客户PO</th>
				<th width="12.5%">PO行项</th>
				<th width="12.5%">操作</th>
			</tr>
		</thead>
		<tbody id="tbody">

		</tbody>
	</table>
</div>
<div id="demo1"></div>

@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/layui/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/custom/js/pack/pack-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/pack/sku.js?v={{$release}}"></script>
@endsection