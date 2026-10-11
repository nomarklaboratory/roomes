"""Render every approved GLB to an original transparent product thumbnail."""
import bpy, math, os, json
from mathutils import Vector
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(root, 'public/models/manifest.json')) as file:
    ids = list(json.load(file)['assets'])
if os.environ.get('ROOMES_ASSET_ID'):
    ids = [os.environ['ROOMES_ASSET_ID']]
for product_id in ids:
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=os.path.join(root, 'public/models', product_id + '.glb'))
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector(tuple(min(c[i] for c in corners) for i in range(3)))
    hi = Vector(tuple(max(c[i] for c in corners) for i in range(3)))
    target = (lo + hi) / 2
    span = max(hi.x-lo.x, hi.y-lo.y, hi.z-lo.z)
    bpy.ops.object.camera_add(location=target + Vector((2.8, -4, 2.5)) * max(span, .5))
    camera = bpy.context.object; camera.rotation_euler = (target-camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type='ORTHO'; camera.data.ortho_scale=span*1.85
    scene=bpy.context.scene; scene.camera=camera
    for pos, energy, size in [((3,-4,6),700,5),((-4,-1,3),350,4),((1,3,5),500,3)]:
        bpy.ops.object.light_add(type='AREA', location=target+Vector(pos)); light=bpy.context.object
        light.data.energy=energy; light.data.shape='DISK'; light.data.size=size
        light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler()
    scene.world.color=(.45,.45,.45)
    scene.render.engine='CYCLES'; scene.cycles.samples=16
    scene.cycles.use_denoising=True
    scene.render.resolution_x=480; scene.render.resolution_y=360; scene.render.resolution_percentage=100
    scene.render.film_transparent=True; scene.render.image_settings.file_format='PNG'
    scene.view_settings.view_transform='AgX'
    scene.render.filepath=os.path.join(root,'public/thumbnails',product_id+'.png')
    bpy.ops.render.render(write_still=True)
    print('Rendered '+product_id)
