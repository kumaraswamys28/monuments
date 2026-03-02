import GaugeComponent from "react-gauge-component";

export default function HumidityGauge() {
  return (
    <GaugeComponent
      value={46}
      type="radial"
      arc={{
        colorArray: ["#5BE12C", "#F5CD19", "#EA4228"],
        subArcs: [{ limit: 30 }, { limit: 60 }, { limit: 100 }]
      }}
      labels={{
        valueLabel: { formatTextValue: v => v + "%" }
      }}
    />
  );
}