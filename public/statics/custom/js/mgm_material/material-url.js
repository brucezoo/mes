var URLS={
	category: {
		store: '/MaterialCategory/store',
		update: '/MaterialCategory/update',
		show: '/MaterialCategory/show',
		delete: '/MaterialCategory/destroy',
		list: '/MaterialCategory/treeIndex',
		selectList: '/MaterialCategory/select',
		unique: '/MaterialCategory/unique',
		procedure: '/operation/getOperationMaterialCategory',
		procedureAll: '/operation/AllIndex',
		procedureMcate: '/operation/operationMaterialCategory',
		unitList:'/getUnits',
		// tempSelect: '/MaterialTemplate/select'
		getMaterialCategoryNeedList:'/Workshop/getMaterialCategoryNeedList'
	},
	group: {
		store: '/MaterialGroup/store',
		update: '/MaterialGroup/update',
		show: '/MaterialGroup/show',
		delete: '/MaterialGroup/destroy',
		list: '/MaterialGroup/index',
		selectList: '/MaterialGroup/select',
		unique: '/MaterialGroup/unique',
		selectChoose: '/MaterialGroup/choose'
	},
	types: {
		store: '/MaterialTemplateType/store',
		update: '/MaterialTemplateType/update',
		show: '/MaterialTemplateType/show',
		delete: '/MaterialTemplateType/destroy',
		list: '/MaterialTemplateType/treeIndex',
		selectList: '/MaterialTemplateType/select',
		unique: '/MaterialTemplateType/unique'
	},
	attr: {
		store: '/MaterialAttributeDefinition/store',
		update: '/MaterialAttributeDefinition/update',
		show: '/MaterialAttributeDefinition/show',
		delete: '/MaterialAttributeDefinition/destroy',
		list: '/MaterialAttributeDefinition/pageIndex',
		oplist: '/OperationAttributeDefinition/pageIndex',
		unique: '/MaterialAttributeDefinition/unique',
		getCode: '/encoding/get'
	},
	template: {
		store: '/MaterialTemplate/store',
		update: '/MaterialTemplate/update',
		show: '/MaterialTemplate/show',
		select: '/MaterialTemplate/select',
		delete: '/MaterialTemplate/destroy',
		list: '/MaterialTemplate/pageIndex',
		treeList: '/MaterialTemplate/treeIndex',
		attr: '/MaterialTemplate/optionalMaterialAttributes',
		attrSelected: '/MaterialTemplate/selectedMaterialAttributes',
		attrParent: '/MaterialTemplate/extendMaterialAttributes/',
		opattr: '/MaterialTemplate/optionalOperationAttributes',
		opattrSelected: '/MaterialTemplate/selectedOperationAttributes',
		opattrParent: '/MaterialTemplate/extendOperationAttributes',
		ops: '/getOperations',
		opattrByOP: '/MaterialTemplate/linkOperationAttributes',
		saveAttr: '/MaterialTemplate/bindMaterialAttributes',
		saveOPAttr: '/MaterialTemplate/bindOperationAttributes',
		saveCode: '/MaterialTemplate/setAutoCode',
		saveAttrFilter: '/MaterialTemplate/setAttributesFilter',
		attrFilter: '/MaterialTemplate/attributesFilter',
		unique: '/MaterialTemplate/unique'
	},
	material: {
		store: '/Material/store',
		validMaterial: '/MaterialTemplate/getTemplateOn',
		update: '/Material/update',
		updateGYAttr: '/material/index/updateOperationAttribute',
		updatePic: '/material/index/updateDrawings',
		updateFujian: '/material/index/updateAttachments',
		attrlist: '/Material/getTemplateAttributeList',
		temAttrList: '/Material/getMaterialTemplateAttributeList',
		parentTemplate: '/material/index/getParentTemplate',
		parentMaterial: '/Material/getGeneticReferMaterial',
		attrValue: '/Material/getAttributeValueList',
		getCode: '/encoding/get',
		show: '/Material/show',
		delete: '/Material/destroy',
		list: '/Material/pageIndex',
		unique: '/Material/unique',
		picType: '/ImageGroupType/selectAll',
		picGroup: '/ImageGroup/select',
		picList: '/Image/getImagesByCategory',
		templateCategory: '/index.php/MaterialTemplate/getCategory',
		categoryGroup: '/MaterialCategory/getGroupByCategory',
		picShow: '/Image/show',
		attachment: '/Download/attachment',
		uploadAttachment: '/Upload/attachment',
		deleteAttachment: '/Upload/destroy',
		sameMaterial: '/Material/checkSimilar'
	},
	log: {
		logList: '/Trace/pageIndex',
		operator: '/Trace/operators'
	},

	/******************************修改 **************************/
	add: {
		getFactory:'/MaterialTemplate/getFactory',
		ins:'/MaterialTemplate/getWarehouse',
		ware:'/MaterialTemplate/insertMaterialsWarehouse',
		find:'/MaterialTemplate/getMaterialsWarehouseByCode',
		del:'/MaterialTemplate/deleteMaterialsWarehouseByCode',
		modify:'/MaterialTemplate/updateMaterialsWarehouse'
	},
	translate: {
		get: '/Language/getAllLanguage',
	}
}