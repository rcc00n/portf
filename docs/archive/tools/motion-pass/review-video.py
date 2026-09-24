# Historical local review helper; not maintained CI. Review URLs and side effects before running.
"""Extract timed frames from actual recordings for visual review."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import subprocess,sys
OUT=Path(__file__).resolve().parent
FFMPEG='/home/raccoon/.cache/ms-playwright/ffmpeg-1011/ffmpeg-linux'
for name in sys.argv[1:]:
 video=OUT/name;frames=OUT/(video.stem+'-frames');frames.mkdir(exist_ok=True)
 for old in frames.glob('*.png'):old.unlink()
 for old in OUT.glob(video.stem+'-review-*.jpg'):old.unlink()
 subprocess.run([FFMPEG,'-y','-loglevel','error','-i',str(video),'-vf','scale=540:-1','-r','2','-fps_mode','cfr',str(frames/'%03d.png')],check=True)
 files=sorted(frames.glob('*.png'))
 for part,start in enumerate(range(0,len(files),16),1):
  sample=files[start:start+16];im=Image.open(sample[0]);tw,th=im.size;cellh=th+25
  sheet=Image.new('RGB',(tw*4,cellh*4),'#20211e');draw=ImageDraw.Draw(sheet)
  for i,f in enumerate(sample):
   x=i%4*tw;y=i//4*cellh;sheet.paste(Image.open(f),(x,y+25));draw.text((x+8,y+5),f'{video.stem} · {(start+i)*.5:.1f}s',fill='#efebe0')
  sheet.save(OUT/f'{video.stem}-review-{part}.jpg',quality=88)
 print(name,len(files),'reviewed frames available',flush=True)
