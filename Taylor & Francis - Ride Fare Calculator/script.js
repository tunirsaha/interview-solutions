async function getJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

const rateConfig = Promise.all([
  getJson("rate-card.json"),
  getJson("demand-levels.json"),
  getJson("promo-codes.json"),
]);

function getCostByDistance(costPerKM, distanceInKms) {
  let cost = 0;
  let _distanceInKms = distanceInKms;
  for (let i = 0; i < costPerKM.length; i++) {
    const tierKms = costPerKM[i].uptoKms
      ? Math.min(costPerKM[i].uptoKms, _distanceInKms)
      : _distanceInKms;
    cost += costPerKM[i].value * tierKms;
    _distanceInKms -= tierKms;
  }
  return cost;
}

function getCostByMinute(costPerMinute, durationInMinutes) {
  let cost = 0;
  let _durationInMinutes = durationInMinutes;
  for (let i = 0; i < costPerMinute.length; i++) {
    const tierMins = costPerMinute[i].uptoMins
      ? Math.min(costPerMinute[i].uptoMins, _durationInMinutes)
      : _durationInMinutes;
    cost += costPerMinute[i].value * tierMins;
    _durationInMinutes -= tierMins;
  }
  return cost;
}

async function calculateRate(
  vehicleType,
  distance,
  duration,
  demand = "",
  promoCode = "",
) {
  const [rateCard, demandLevelMultiplier, promoCodeMap] = await rateConfig;
  // input sanitization to be done here
  const _vType = vehicleType.toLowerCase();
  const _distance = !isNaN(distance) ? distance : 0;
  const _duration = !isNaN(duration) ? duration : 0;
  const _demand = demand ? demand.toLowerCase() : "normal";
  const _promoCode = promoCode ? promoCode.toUpperCase() : "NOCODE";
  if (_promoCode === "FREERIDE") return 0;

  const _rateValue = rateCard[_vType];
  const { base, costPerKM, costPerMinute, minFare } = _rateValue;

  const _promoValue = promoCodeMap[_promoCode] ?? promoCodeMap.NOCODE;
  const _demandValue = demandLevelMultiplier[_demand];

  const distanceCost = getCostByDistance(costPerKM, _distance);
  const timeCost = getCostByMinute(costPerMinute, _duration);
  const variableCost = _rateValue.greaterOfDistanceAndTime
    ? Math.max(distanceCost, timeCost)
    : distanceCost + timeCost;

  // min fare applies before promo so a free-ride code can reach 0
  const formulaPriceAfterDemand = Math.max((base + variableCost) * _demandValue, minFare);
  const deductionValue = _promoValue.isPercentage
    ? (formulaPriceAfterDemand * _promoValue.value) / 100
    : _promoValue.value;
  return formulaPriceAfterDemand - deductionValue;
}

(async () => {
  console.log(await calculateRate("Economy", 8.5, 22));
  console.log(await calculateRate("suv", 1, 3));
  console.log(await calculateRate("premium", 15, 35));
  console.log(await calculateRate("Suv", 10, 5));
  console.log(await calculateRate("Suv", 1, 3, 'peak'));
  console.log(await calculateRate("economy", 8.5, 22, 'high', 'welcome10'));
  console.log(await calculateRate("XL", 12, 20, 'normal'));
  console.log(await calculateRate("economy", 8.5, 22, 'normal', 'FLAT50'));
  console.log(await calculateRate("economy", 5, 10, 'normal', 'FREERIDE'));
})();
