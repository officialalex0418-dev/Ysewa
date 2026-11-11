-- YatraSewa: release-seats.lua
-- Releases locks ONLY if the lock owner matches actorId (prevents stealing).
-- KEYS: N seat lock keys
-- ARGV: [actorId]
-- Returns: number of keys released.

local actorId = ARGV[1]
local released = 0
for i = 1, #KEYS do
  local cur = redis.call("GET", KEYS[i])
  if cur == actorId then
    redis.call("DEL", KEYS[i])
    released = released + 1
  end
end
return released
