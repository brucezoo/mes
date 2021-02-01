<?php
/**
 * Created by PhpStorm.
 * User: zhufeng
 * Date: 2018/8/28
 * Time: 下午4:03
 */

namespace App\Http\Controllers\Sap;

use App\Http\Controllers\Controller;
use App\Http\Models\Sap\SyncSapMaterial;
use Illuminate\Http\Request;
use App\Http\Models\SapApiRecord;
use App\Jobs\SyncBomMaterial;

/**
 * 同步 SAP Material 控制器
 * Class syncSapMaterialController
 * @package App\Http\Controllers\Sap
 * @author Bruce.Chu
 */
class SyncSapMaterialController extends Controller
{
    public function __construct()
    {
        parent::__construct();
        if (empty($this->model)) $this->model = new SyncSapMaterial();
    }

    /**
     * SAP导入material（接口同步）
     *
     * 1.先处理请求参数
     * 2.存储到api日志表
     * 3.调用Model处理；有错误则抛出异常
     * 4.返回success
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
//    public function syncSapMaterial(Request $request)
//    {
//        $input = $request->all();
//        trim_strings($input);
//        api_to_txt($input, $request->path());
//        $ApiControl = new SapApiRecord();
//        $ApiControl->store($input);
//        //联系M层处理
//        $this->model->syncSapMaterial($input['DATA']);
//        return response()->json(get_success_sap_response($input));
//    }

    /**
     * SAP导入material （队列）
     *
     * 1.先处理请求参数
     * 2.存储到API日志表
     * 3.入队列，等待处理
     * 4.返回请求。
     * 5.脚本处理队列
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \App\Exceptions\ApiException
     * @throws \App\Exceptions\ApiSapException
     */
    public function syncSapMaterial(Request $request)
    {
        // $strjson='{"CONTROL":{"SERVICEID":"INT_PP000300012","SRVGUID":"005056B539851ED9BBE1A8BF5B1C39AC","SRVTIMESTAMP":20191015053507,"SOURCESYSID":"0003","TARGETSYSID":"0022"},"DATA":{"MARA":[{"MATNR":"000000100101005209","LANGU":"ZH","MAKTX":"切割绵床垫/AATZ/220*220*38CM","MTART":"Z001","MTBEZ":"成品","MATKL":"100101","WGBEZ":"切割绵床垫","MEINS":"PC","BSTME":"","MSTAE":"Z1","ZMA001":"ddd/切割绵床垫/AATZ/220*220*38CM"},{"MATNR":"000000600100011636","LANGU":"ZH","MAKTX":"空气层/1.80M/180G/M01-0001","MTART":"Z004","MTBEZ":"面料","MATKL":"6001","WGBEZ":"空气层","MEINS":"M","BSTME":"","MSTAE":"Z2","ZMA001":"空气层/1.80M/180G/M01-0001/100%涤/无要求/222"},{"MATNR":"000000100101005209","LANGU":"EN","MAKTX":"Cut cotton mattress/AATZ/220*220*38CM","MTART":"Z001","MTBEZ":"Finished Product","MATKL":"100101","WGBEZ":"","MEINS":"PC","BSTME":"","MSTAE":"Z1","ZMA001":"ddd/Cut cotton mattress/AATZ/220*220*38CM"},{"MATNR":"000000600100011636","LANGU":"EN","MAKTX":"Air layer/1.80M/180G/M01-0001","MTART":"Z004","MTBEZ":"Raw materials","MATKL":"6001","WGBEZ":"","MEINS":"M","BSTME":"","MSTAE":"Z2","ZMA001":"Air layer/1.80M/180G/M01-0001/100% polyester/No request/222"}],"MARC":[{"MATNR":"000000100101005209","WERKS":"1101","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""},{"MATNR":"000000100101005209","WERKS":"1102","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""},{"MATNR":"000000100101005209","WERKS":"1103","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""},{"MATNR":"000000600100011636","WERKS":"1101","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""},{"MATNR":"000000600100011636","WERKS":"1102","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""},{"MATNR":"000000600100011636","WERKS":"1103","FEVOR":"","AUSME":"","XCHAR":"","UNETO":0,"UEETO":0,"UEETK":"","MMSTA":"","LGPRO":"","SBDKZ":"","VERKZ":"","LGFSB":"","BESKZ":"","SCHGT":""}],"MARM":[{"MATNR":"000000100101005209","MEINH":"PC","UMREZ":1,"UMREN":1},{"MATNR":"000000600100011636","MEINH":"M","UMREZ":1,"UMREN":1}],"ZTWLCC":[{"MATNR":"000000100101005209","LANGU":"EN","ZATNAM01":"M001","ZATBEZ01":"Name","ZATWRT01":"ddd","ZATNAM02":"M044","ZATBEZ02":"Finished product type","ZATWRT02":"Cut cotton mattress","ZATNAM03":"M016","ZATBEZ03":"client","ZATWRT03":"AATZ","ZATNAM04":"M005","ZATBEZ04":"LONG","ZATWRT04":"220","ZATNAM05":"M017","ZATBEZ05":"width","ZATWRT05":"220","ZATNAM06":"M013","ZATBEZ06":"thickness","ZATWRT06":"38","ZATNAM07":"M042","ZATBEZ07":"Unit","ZATWRT07":"CM","ZATNAM08":"M003","ZATBEZ08":"note","ZATWRT08":"","ZATNAM09":"","ZATBEZ09":"","ZATWRT09":"","ZATNAM10":"","ZATBEZ10":"","ZATWRT10":"","ZATNAM11":"","ZATBEZ11":"","ZATWRT11":"","ZATNAM12":"","ZATBEZ12":"","ZATWRT12":"","ZATNAM13":"","ZATBEZ13":"","ZATWRT13":"","ZATNAM14":"","ZATBEZ14":"","ZATWRT14":"","ZATNAM15":"","ZATBEZ15":"","ZATWRT15":""},{"MATNR":"000000100101005209","LANGU":"ZH","ZATNAM01":"M001","ZATBEZ01":"名称","ZATWRT01":"ddd","ZATNAM02":"M044","ZATBEZ02":"成品种类","ZATWRT02":"切割绵床垫","ZATNAM03":"M016","ZATBEZ03":"客户","ZATWRT03":"AATZ","ZATNAM04":"M005","ZATBEZ04":"长度","ZATWRT04":"220","ZATNAM05":"M017","ZATBEZ05":"宽度","ZATWRT05":"220","ZATNAM06":"M013","ZATBEZ06":"厚度","ZATWRT06":"38","ZATNAM07":"M042","ZATBEZ07":"单位","ZATWRT07":"CM","ZATNAM08":"M003","ZATBEZ08":"备注","ZATWRT08":"","ZATNAM09":"","ZATBEZ09":"","ZATWRT09":"","ZATNAM10":"","ZATBEZ10":"","ZATWRT10":"","ZATNAM11":"","ZATBEZ11":"","ZATWRT11":"","ZATNAM12":"","ZATBEZ12":"","ZATWRT12":"","ZATNAM13":"","ZATBEZ13":"","ZATWRT13":"","ZATNAM14":"","ZATBEZ14":"","ZATWRT14":"","ZATNAM15":"","ZATBEZ15":"","ZATWRT15":""},{"MATNR":"000000600100011636","LANGU":"EN","ZATNAM01":"M001","ZATBEZ01":"Name","ZATWRT01":"Air layer","ZATNAM02":"M006","ZATBEZ02":"width","ZATWRT02":"1.80M","ZATNAM03":"M012","ZATBEZ03":"gram weight","ZATWRT03":"180G","ZATNAM04":"M008","ZATBEZ04":"Contributes presents no.","ZATWRT04":"M01-0001","ZATNAM05":"M021","ZATBEZ05":"Fabric composition","ZATWRT05":"100% polyester","ZATNAM06":"M020","ZATBEZ06":"Special requirements","ZATWRT06":"No request","ZATNAM07":"M003","ZATBEZ07":"note","ZATWRT07":"222","ZATNAM08":"","ZATBEZ08":"","ZATWRT08":"","ZATNAM09":"","ZATBEZ09":"","ZATWRT09":"","ZATNAM10":"","ZATBEZ10":"","ZATWRT10":"","ZATNAM11":"","ZATBEZ11":"","ZATWRT11":"","ZATNAM12":"","ZATBEZ12":"","ZATWRT12":"","ZATNAM13":"","ZATBEZ13":"","ZATWRT13":"","ZATNAM14":"","ZATBEZ14":"","ZATWRT14":"","ZATNAM15":"","ZATBEZ15":"","ZATWRT15":""},{"MATNR":"000000600100011636","LANGU":"ZH","ZATNAM01":"M001","ZATBEZ01":"名称","ZATWRT01":"空气层","ZATNAM02":"M006","ZATBEZ02":"门幅","ZATWRT02":"1.80M","ZATNAM03":"M012","ZATBEZ03":"克重","ZATWRT03":"180G","ZATNAM04":"M008","ZATBEZ04":"样册号","ZATWRT04":"M01-0001","ZATNAM05":"M021","ZATBEZ05":"成分","ZATWRT05":"100%涤","ZATNAM06":"M020","ZATBEZ06":"特殊要求","ZATWRT06":"无要求","ZATNAM07":"M003","ZATBEZ07":"备注","ZATWRT07":"222","ZATNAM08":"","ZATBEZ08":"","ZATWRT08":"","ZATNAM09":"","ZATBEZ09":"","ZATWRT09":"","ZATNAM10":"","ZATBEZ10":"","ZATWRT10":"","ZATNAM11":"","ZATBEZ11":"","ZATWRT11":"","ZATNAM12":"","ZATBEZ12":"","ZATWRT12":"","ZATNAM13":"","ZATBEZ13":"","ZATWRT13":"","ZATNAM14":"","ZATBEZ14":"","ZATWRT14":"","ZATNAM15":"","ZATBEZ15":"","ZATWRT15":""}],"XJWLDZ":[]}}';
        // $input=json_decode($strjson,true);
        // $this->model->syncSapMaterial($input['DATA']);
        $input = $request->all();
        trim_strings($input);
        api_to_txt($input, $request->path());

//        $ApiControl = new SapApiRecord();
//        $api_id = $ApiControl->store($input);

        $input['_type'] = 'materiel';
        $input['REQUEST_URI'] = '/Sap/syncMaterial';
//        $input['_api_id'] = $api_id;
        $job = (new SyncBomMaterial($input))->onQueue('bom_materiel');
        $this->dispatch($job);

        //联系M层处理\
    //    $this->model->syncSapMaterial(json_decode($input['DATA'],true));
        return response()->json(get_success_sap_response($input));
    }
}