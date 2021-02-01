<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <title>称重</title>
    <meta name="description" content="overview &amp; stats" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    {{--icon--}}
    <link rel="shortcut icon" href="../../../statics/custom/img/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="../../../statics/custom/css/offcutWeight/offcutWeight.css?v={{$release}}" />
</head>

<body >
<div>
    <div style="height:100px;">
        <img src="/statics/custom/img/back.jpg" class="back" onclick="javascript: history.go(-1);" style="width: 50px;height: 50px;margin-top: 25px;"/>
    </div>
    <div style="flex: 10;margin-top: 10px;margin-bottom: 10px;">
        <div>
            <div style="display: flex;">
                <div id="choose_factory" style="flex: 2;height: 100px;line-height: 100px; border-radius: 3px;text-align: center;">
                    请选择工厂
                </div>
                <div class="factorys" style="flex: 8;margin: 0">

                </div>
            </div>
        </div>
    </div>
    <div style="display: flex;margin-bottom: 10px;">
        <div style="flex: 10;">
            <div>
                <div style="display: flex;flex-direction: row;">
                    <div style="flex: 2;height: 100px;text-align: center;line-height: 100px;">边角料类型</div>
                    <div style="flex: 8" id="offcut_type"></div>
                </div>
                <div style="display: flex;flex-direction: row;margin-top: 10px;">
                    <div style="flex: 2;height: 100px;text-align: center;line-height: 100px;">边角料</div>
                    <div style="flex: 8" id="offcun_from"></div>
                </div>
            </div>
        </div>
    </div>

    <div style="display: flex;flex-direction: row;">
        <div style="flex: 1;text-align: center;vertical-align: middle;position:relative;">
            <input type="text" id="weight">
            <br>
            <table>
                <tr>
                    <td data-id="1">1</td>
                    <td data-id="2">2</td>
                    <td data-id="3">3</td>
                    <td data-id="4">4</td>
                </tr>
                <tr>
                    <td data-id="5">5</td>
                    <td data-id="6">6</td>
                    <td data-id="7">7</td>
                    <td data-id="8">8</td>
                </tr>
                <tr>
                    <td data-id="9">9</td>
                    <td data-id="0">0</td>
                    <td data-id="10">·</td>
                    <td data-id="11">←</td>
                </tr>
            </table>
        </div>
        <div style="flex: 1;position:relative;" class="left_table">
            <button class="submit_offcut"  id="submit" style="position: absolute;bottom:20px;left:35%;">提&nbsp;&nbsp;交</button>
        </div>
    </div>
</div>

<script src="../../../statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<script src="../../../statics/custom/js/offcut/offcutWeightOld.js?v={{$release}}"></script>
<script src="../../../statics/common/layer/layer.js"></script>

<!-- 自定义的公共js -->
<script type="text/javascript" src="../../../statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
<script src="../../../statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
<script src="../../../statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}

<script src="../../../statics/custom/js/offcut/offcut_url.js?v={{$release}}"></script>

</body>
</html>
