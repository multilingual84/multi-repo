// @vitest-environment node
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {expect,it,vi} from 'vitest';
function worker(){
 const handlers=new Map<string,(e:any)=>void>();const show=vi.fn().mockResolvedValue(undefined),open=vi.fn().mockResolvedValue(undefined);
 runInNewContext(readFileSync('public/call-notifications-sw.js','utf8'),{URL,Date,self:{location:{origin:'https://multi-lingual.tech'},addEventListener:(name:string,fn:(e:any)=>void)=>handlers.set(name,fn),registration:{showNotification:show},clients:{matchAll:async()=>[],openWindow:open}}});
 return {handlers,show,open};
}
it('shows a silent test and opens only the non-call test page',async()=>{
 const w=worker();let pending:Promise<unknown>|undefined;
 w.handlers.get('push')?.({data:{json:()=>({title:'Test',body:'Test',path:'/?push-test=1',tag:'test',expires:Date.now()+60000})},waitUntil:(p:Promise<unknown>)=>pending=p});await pending;
 expect(w.show).toHaveBeenCalledWith('Test',expect.objectContaining({silent:true,data:{path:'/?push-test=1'}}));
 w.handlers.get('notificationclick')?.({notification:{close:vi.fn(),data:{path:'/?push-test=1'}},waitUntil:(p:Promise<unknown>)=>pending=p});await pending;
 expect(w.open).toHaveBeenCalledWith('https://multi-lingual.tech/?push-test=1');
});
it('rejects malformed codes, external destinations and expired notifications',()=>{
 const w=worker();for(const path of ['https://evil.example/','/?incoming=1#my-code-------------------------------------'])w.handlers.get('push')?.({data:{json:()=>({path,expires:Date.now()+60000})},waitUntil:vi.fn()});
 w.handlers.get('push')?.({data:{json:()=>({path:'/?push-test=1',expires:Date.now()-1})},waitUntil:vi.fn()});
 expect(w.show).not.toHaveBeenCalled();
});