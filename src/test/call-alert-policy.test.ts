import {afterEach,expect,it,vi} from 'vitest';
import {pushCallPath,pushContext,pushEndpoint} from '@/lib/push-policy';
import {enableNotifications} from '@/lib/push-browser';
afterEach(()=>vi.unstubAllGlobals());
it('routes incoming alerts to the public code without any private account seed',()=>{
 expect(pushCallPath('11111111-1111-4111-8111-111111111111')).toBe('/?incoming=1#my-code-11111111-1111-4111-8111-111111111111');
 expect(()=>pushCallPath('not-a-code')).toThrow();
});
it('requires standalone iPhone installation before notification permission',()=>{
 expect(pushContext({embedded:false,iphone:true,standalone:false,supported:true})).toBe('iphone');
 expect(pushContext({embedded:false,iphone:true,standalone:true,supported:true})).toBe('ready');
});
it('rejects arbitrary endpoints rather than sending subscriptions to untrusted hosts',()=>{
 expect(pushEndpoint.safeParse('https://example.com/push').success).toBe(false);
 expect(pushEndpoint.safeParse('https://web.push.apple.com/test').success).toBe(true);
});
it('registers alerts without microphone, camera or audio access',async()=>{
 const capture=vi.fn(),audio=vi.fn(),subscribe=vi.fn().mockResolvedValue({endpoint:'test'});
 const registration={pushManager:{getSubscription:vi.fn().mockResolvedValue(null),subscribe}};
 vi.stubGlobal('Notification',{permission:'default',requestPermission:vi.fn().mockResolvedValue('granted')});
 vi.stubGlobal('PushManager',class {});
 vi.stubGlobal('matchMedia',()=>({matches:true}));
 vi.stubGlobal('navigator',{userAgent:'iPhone',platform:'iPhone',maxTouchPoints:1,mediaDevices:{getUserMedia:capture},serviceWorker:{register:vi.fn().mockResolvedValue(registration),ready:Promise.resolve(registration)}});
 vi.stubGlobal('Audio',audio);
 const result=await enableNotifications('AAAA');
 expect(result.status).toBe('registered');
 expect(subscribe).toHaveBeenCalledWith({userVisibleOnly:true,applicationServerKey:expect.any(Uint8Array)});
 expect(capture).not.toHaveBeenCalled();expect(audio).not.toHaveBeenCalled();
});