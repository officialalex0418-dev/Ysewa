-- YatraSewa: acquire-seats.lua
-- Atomically locks multiple seats with NX EX semantics.
-- KEYS: N seat lock keys, format seat_lock:{tripId}:{seatLabel}
-- ARGV: [actorId, ttlSeconds]
-- Returns: {1} on success OR {0, failedKeyIndex} on failure (all acquired so far are rolled back).

local actorId = ARGV[1]
local ttl = tonumber(ARGV[2])
local acquired = {}

for i = 1, #KEYS do
  local ok = redis.call("SET", KEYS[i], actorId, "NX", "EX", ttl)
  if ok then
    table.insert(acquired, KEYS[i])
  else
    -- roll back
    for _, key in ipairs(acquired) do
      redis.call("DEL", key)
    end
    return {0, i}
  end
end
return {1}
