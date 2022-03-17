function position(radius, angle_h, angle_v)
{
	rads_h = angle_h * Math.PI / 180.0
	rads_v = angle_v * Math.PI / 180.0
	x = Math.sin(rads_h)
	z = Math.cos(rads_h)
	y = Math.sin(rads_v)
	module = Math.sqrt(x*x + y*y + z*z)
	resultX = x * radius / module
	resultY = y * radius / module
	resultZ = z * radius / module
	
	return {x: resultX, y: resultY, z: resultZ}
}
