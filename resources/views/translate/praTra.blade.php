{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/common/el/layui.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div style="">
	<!-- <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="ability">添加能力</button> -->
	<button type="button" class="layui-btn layui-btn-primary layui-btn-sm" id="save">一键保存</button>
	<button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;" id="printOut"><a href="" id="printOuta">导出</a></button>
	<button type="button" class="layui-btn layui-btn-normal layui-btn-sm" id="test8">导入</button>
	<button type="button" class="layui-btn layui-btn-sm" id="test9">上传</button>
	<div style="float:right;">
		<label>语言:</label>
		<select style="width:150px;" id="list">
		</select>
		<button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;margin-top:-3px;" id="translate">翻译</button>
	</div>
	<hr class="layui-bg-gray">
</div>
<div class="table">
	<table class="layui-table">
		<thead>
			<tr>
				<th><input type="checkbox" id="choice"> 全选</th>
				<th>编码</th>
				<th>名称</th>
				<th>name</th>
				<th>描述</th>
				<th>description</th>
			</tr>
		</thead>
		<tbody id="tbody">

		</tbody>
	</table>
</div>

<div id="demo2-1"></div>
@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>

<script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/translate/praTra.js?v={{$release}}"></script>


@endsection