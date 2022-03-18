// targetPosition: THREE.Vector3
// observerPosition: THREE.Vector3
function getCloserPosition(targetPosition, observerPosition, distance)
{
	dx = targetPosition.x - observerPosition.x
	dy = targetPosition.y - observerPosition.y
	dz = targetPosition.z - observerPosition.z
	module = Math.sqrt(dx*dx + dy*dy + dz*dz)
	dx *= (distance / module)
	dy *= (distance / module)
	dz *= (distance / module)
	resultX = observerPosition.x + dx
	resultY = observerPosition.y + dy
	resultZ = observerPosition.z + dz
	
	return [resultX, resultY, resultZ]
}
