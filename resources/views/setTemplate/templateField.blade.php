{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")

<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/calendar.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/setTemplate/templateField.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div class="div_con_wrapper" id="appsss">
    <div class="actions">
        <button class="button btn-save" @click="saveData">保存</button>
    </div>
    <div class="main-content">
        <div class="content-left">
            <div class="material-name">模板名称</div>
            <ul class="ul-first">
                <li v-for="(item, index) in fristTreeList" :key="item.id">
                    <i class="tag-i el-icon itemIcon" @click="tagClick('second', index)"></i>
                    <span @click="selectMaterial(item.id)" :style="{backgroundColor:selectMaterialId==item.id?selectStyle.bgColor:'', color:selectMaterialId==item.id?selectStyle.wDColor:''}">
                        <span v-text="item.name"></span>(<span v-text="item.code"></span>)
                    </span>
                    <ul class="ul-second second">
                        <li v-for="(iitem, iindex) in hasChildsList(allTreeList, item.id)" :key="iitem.id">
                            <i class="tag-i el-icon itemIcon"></i>
                            <span v-if="(iindex+1) !== hasChildsList(allTreeList, item.id).length" class="tag-prefix"></span>
                            <span v-else class="tag-prefix last-tag"></span>
                            <span :style="{backgroundColor:selectMaterialId==iitem.id?selectStyle.bgColor:'', color:selectMaterialId==iitem.id?selectStyle.wDColor:''}"  @click="selectMaterial(iitem.id)">
                                <span v-text="iitem.name"></span>(<span v-text="iitem.code"></span>)
                            </span>
                            <ul class="ul-three">
                                <li v-for="(iiitem, iiindex) in hasChildsList(allTreeList, iitem.id)" :key="iiitem.id">
                                    <span v-if="(iiindex+1) !== hasChildsList(allTreeList, iitem.id).length" class="tag-prefix"></span>
                                    <span v-else class="tag-prefix last-tag"></span>
                                    <span :style="{backgroundColor:selectMaterialId==iiitem.id?selectStyle.bgColor:'', color:selectMaterialId==iiitem.id?selectStyle.wDColor:''}" @click="selectMaterial(iiitem.id)">
                                        <span v-text="iiitem.name"></span>(<span v-text="iiitem.code"></span>)
                                    </span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="content-right">
            <div class="material-name">自定义查询字段</div>
            <div class="">
                <div v-if="!addMaterialFieldList.length">
                    <button type="button" @click="addTempField(-1)"><i class="fa fa-plus"></i></button>
                </div>
                <div style="display: flex; margin-top: 10px;" v-for="(item, index) in addMaterialFieldList">
                    <div style='position: relative; margin-left: 10px; margin-right: 20px;'>
                        <label style="margin-right: 12px;" class="el-form-item-label show-material top-material">字段名称</label>
                        <input v-model="item.name" type="text" class="el-input" placeholder="请输入字段名称">
                    </div>
                    <div style='display:flex;position: relative; margin-left: 10px; margin-right: 20px;'>
                        <label style="padding-top: 6px;" class="el-form-item-label show-material top-material">字段值</label>
                        <div style="margin-left:20px;">
                            <div style="margin-bottom: 10px;" v-for="(iitem, iindex) in item.values" :key="iindex">
                                <input v-model="item.values[iindex]" type="text" class="el-input" placeholder="请输入字段值">
                            </div>
                            <div>
                                <button type="button" @click="addFieldValue(index)"><i class="fa fa-plus"></i></button>
                                <button v-if="item.values.length>1" type="button" @click="deleteFieldValue(index)"><i class="fa fa-minus"></i></button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button type="button" @click="addTempField(index)"><i class="fa fa-plus"></i></button>
                        <button type="button" @click="deleteTempField(index)"><i class="fa fa-minus"></i></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="../../../statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<script src="/statics/common/layer/layer.js?v={{$release}}"></script>
<script src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/common/vue/vue.js"></script>
<script src="/statics/common/vue/axios.min.js"></script>
<script src="/statics/common/ace/assets/js/moment.min.js"></script>

<script>
    var app = new Vue({
        delimiters: ['@{', '}'],
        el: '#appsss',
        data: {
            token: '8b5491b17a70e24107c89f37b1036078',
            allTreeList: [],
            fristTreeList: [],
            selectStyle: {
                bgColor: '',
                wDColor: ''
            },
            selectMaterialId: '',
            addMaterialFieldList: []
        },
        created() {
           this.getTreeList();
        },
        watch: {
            
        },
        methods: {
            // 点击小图标
            tagClick() {

            },
            // 获取物料分类数据
            getTreeList() {
                var url = `/MaterialCategory/treeIndex?`;
                axios.get(url, {
                    params: {
                        _token: this.token
                    }
                }).then(res => {
                    if(res.data.code == '200') {
                        if (res.data.results && res.data.results.length) { 
                            var data = res.data.results;
                            var parentId = data[0].parent_id;
                            this.allTreeList = data;
                            this.treeHtml(data, parentId);
                        }
                        
                    } else{
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    console.log(error, '获取物料分类数据失败');
                })
            },

            // 展示物料分类树
            treeHtml(data, parentId) {
                var children = getChildById(data, parentId);
                this.fristTreeList = children;
            },

            // 子集数据
            hasChildsList(data,id){
                if(hasChilds(data,id).length !== 0) {
                    let childrenList = getChildById(data,id);
                    return childrenList;
                } else {
                    return [];
                }
            },

            // 选择物料
            selectMaterial(materialId) {
                this.selectMaterialId = materialId;
                this.selectStyle = {
                    bgColor: 'rgb(188, 217, 252)',
                    wDColor: '#4B88B7'
                };
                var url = `/BomRouting/getBomRoutingTemplateQuerys?`;
                axios.get(url, {
                    params: {
                        _token: this.token,
                        material_category_id: materialId
                    }
                }).then(res => {
                    if(res.data.code == '200') {
                        if (res.data.results && res.data.results.length) { 
                            var data = res.data.results;
                            data.forEach(function(item) {
                                if(typeof item.values == 'string') {
                                    item.values = JSON.parse(item.values);
                                }
                            });

                            this.addMaterialFieldList = data;
                        } else {
                            this.addMaterialFieldList = [];
                        }
                    } else{
                        LayerConfig('fail', res.data.message);
                    }
                }).catch(error => {
                    console.log(error, '获取物料分类数据失败');
                })
            },

            // 增加字段值
            addFieldValue(index) {
                let arrValue = this.addMaterialFieldList[index].values;
                arrValue.push('');
                this.addMaterialFieldList[index].values = arrValue;
            },

            // 删减字段值
            deleteFieldValue(index) {
                let arrValue = this.addMaterialFieldList[index].values;
                
                if(arrValue.length > 1) {
                    arrValue.pop();
                }
                this.addMaterialFieldList[index].values = arrValue;
            },

            // 增加模板字段
            addTempField(index) {
                let obj = {
                    name: '',
                    values: ['']
                };
                if(this.addMaterialFieldList.length > 14) {
                    LayerConfig('fail','最多增加15个模板字段');
                    return;
                }
                this.addMaterialFieldList.splice(index+1, 0, obj);
            },

            // 删减模板字段
            deleteTempField(index) {
                this.addMaterialFieldList.splice(index,1);
            },
            
            // 对象复制
            cloneObjectFn (obj){ 
                return JSON.parse(JSON.stringify(obj))
            },

            // 保存模板查询字段
            saveData() {
                let _this = this;
                var url = `/BomRouting/addBomRoutingTemplateQuerys`;
                var searchList = this.cloneObjectFn(_this.addMaterialFieldList);

                if(searchList.length) {
                    searchList.forEach(function(item, index) {
                        let vauList = '';
                        if(typeof item.values  !== 'string') {
                            vauList = JSON.stringify(item.values);
                        } 
                        item.values = vauList;
                    })
                }

                if(!_this.selectMaterialId) {
                    LayerConfig('fail','请选择物料');
                    return;
                }

                layer.confirm('确认添加模板查询字段?', {
                    icon: 3, title: '提示', offset: '250px', end: function () {
                    }
                }, function (index) {
                    axios.post(url, {
                        _token: _this.token,
                        material_category_id: _this.selectMaterialId,
                        querys: JSON.stringify(searchList) 
                    }).then(res => { 
                        if(res.data.code == '200') {
                            layer.close(index);
                            LayerConfig('success',res.data.message);
                        } else {
                            LayerConfig('fail',res.data.message);
                        }
                        
                    }).catch(error => {
                        console.log(error);
                    });
                    
                });
            }
        }
    });
</script>
@endsection

@section("inline-bottom")

@endsection