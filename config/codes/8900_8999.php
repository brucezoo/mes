<?php 
/**
 *8000-9000  为仓库的所有错误编码
 *8000-8300  为仓库基础设置错误编码
 *8301-9000  为仓库业务设置错误编码
 */
return [
    //仓库期初
    '8904' => '单据已审核，审核失败！',
    '8905' => '单据未审核，反审失败！',

    // 报工
    '8906' => '最后一道工序不需要入mes！',

    //往来业务伙伴
    '8907' => '名称不可以为空',
    '8908' => '名称已经注册过',
    '8909' => '编码不可以为空',
    '8910' => '编码已经注册过',
    '8911' => '加工商编码只能为1-10位数字',
    '8912' => '已经生成过登录账号',
];
