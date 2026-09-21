import { professorLayout } from './HomeArtwork';
test.each([[320,200,1],[390,149,1],[430,250,1.4]])('Professor hides when space or text sizing needs priority (%s,%s,%s)',(w,h,s)=>expect(professorLayout(w,h,s)).toBeNull());
test.each([[390,170],[430,300],[412,220]])('Professor fits spare space on portrait devices (%s,%s)',(w,h)=>{
 const layout=professorLayout(w,h,1)!;
 expect(layout.height+layout.bottom).toBeLessThanOrEqual(h);expect(layout.width).toBeLessThan(w);expect(layout.right).toBeLessThanOrEqual(0);
});
test('Professor scale grows 1.85x while top-aligning face and cropping lower coat',()=>{
 const layout=professorLayout(430,300,1)!;
 expect(layout.height).toBe(280*1.85);expect(layout.width/layout.height).toBeCloseTo(1086/1448);
 expect(layout.height+layout.bottom).toBe(300);expect(layout.bottom).toBeLessThan(0);
});
