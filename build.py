from pathlib import Path
p=Path(__file__).parent
parts=['1_head.html','2_core.js','3_draw.js','4_ui.js','6_sandbox.js','5_boot.js']
text='\n'.join((p/'src'/f).read_text() for f in parts)+'\n</script>\n</body>\n</html>\n'
(p/'index.html').write_text(text)
print('Built',len(text.encode()),'bytes')
