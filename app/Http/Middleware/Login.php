<?php


namespace App\Http\Middleware;
use Closure;
use Illuminate\Support\Facades\DB;
/**
 * 登陆检测中间件
 * @author  sam.shan  <sam.shan@ruis-ims.cn>
 */
class Login
{

    /**
     * 运行请求过滤器。
     * Handle an incoming request.
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Illuminate\Http\RedirectResponse|\Laravel\Lumen\Http\Redirector|mixed
     * @throws \App\Exceptions\ApiException
     * @throws \Illuminate\Container\EntryNotFoundException
     * @author  sam.shan   <sam.shan@ruis-ims.cn>
     * @since lesteryou 登录后自动跳转到原先的页面
     */
    public function handle($request, Closure $next)
    {
        if (empty(session('administrator')->admin_id)) {

            //获取当前的uri
            $uri = $request->path();
            //判断是否是免登陆的
            $has=DB::table(config('alias.rrn'))->where('node',$uri)->where('type',config('app.node_type.ignore_login'))->where('status',1)->limit(1)->count();
            if(!$has){
                if($request->ajax() || is_postman()) TEA('411');
                $callbackUrl = $request->getRequestUri();
                session(['callbackUrl' => $callbackUrl]);
                return redirect('AccountManagement/login');
            }
            return $next($request);
        }

        //判断是否处于升级中,如果处于升级中，不允许操作
        $admin_id = session('administrator')->admin_id;
        $UPGRADE_WHITE_LIST = getBaseConfig('UPGRADE_WHITE_LIST');//白名单

        $UPGRADE = getBaseConfig('UPGRADE_TYPE');//运维模式 0-不是 1-是
        if($UPGRADE && !in_array($admin_id,$UPGRADE_WHITE_LIST))
        {
            $UPGRADE_TIME = getBaseConfig('UPGRADE_TIME');//运维时间
            if(empty($UPGRADE_TIME))
            {
                $upgrade_begin_time = date("Y-m-d H:i:s", time());
                $upgrade_end_time = date("Y-m-d H:i:s",strtotime("+1 hours"));
            }
            else
            {
                $upgrade_begin_time = date("Y-m-d H:i:s", $UPGRADE_TIME[0]);
                $upgrade_end_time = date("Y-m-d H:i:s",$UPGRADE_TIME[1]);
            }
            session()->flush();
            return response(view('error.upgrade',['upgrade_begin_time'=>$upgrade_begin_time, 'upgrade_end_time'=>$upgrade_end_time]));
        }
        else
        {
            return $next($request);
        }
        //刷新发呆时间,这个就不用了,框架本身已经帮我们做好了,万分感谢
        //return $next($request);
    }



}
