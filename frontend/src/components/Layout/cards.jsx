// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// function Cards({data}) {
// const labelConfig = {
//     aqi: { label: "AQI", unit: "" },
//     humidity: { label: "Humidity", unit: "%" },
//     rainfall: { label: "Rainfall", unit: " mm" },
//     temperature: { label: "Temperature", unit: "°C" },
//     vibration: { label: "Vibration", unit: " Hz" },
//     visitor_count: { label: "Visitor Count", unit: "" },
//   };    
//   return (
//       <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden" >
//      <Table>
//   <TableCaption>Telemetric Data From IOT Devices</TableCaption>
//   <TableHeader>
//     <TableRow>
//       {/* Added pl-6 for left spacing */}
//       <TableHead className="w-[150px] pl-6">Parameters</TableHead> 
//       {/* Added pr-6 for right spacing */}
//       <TableHead className="text-right pr-6">Values</TableHead>
//     </TableRow>
//   </TableHeader>
//   <TableBody>
//     {data && Object.entries(data).map(([key, value]) => (
//       <TableRow key={key}>
//         {/* Added pl-6 to match the header */}
//         <TableCell className="font-medium capitalize pl-6">
//           {labelConfig[key]?.label || key.replace("_", " ")}
//         </TableCell>
//         {/* Added pr-6 to match the header */}
//         <TableCell className="text-right pr-6">
//           {value}
//           {labelConfig[key]?.unit || ""}
//         </TableCell>
//       </TableRow>
//     ))}
//   </TableBody>
// </Table>
//     </div>
//   )
// }

// export default Cards

















import React, { useImperativeHandle, useRef, forwardRef } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Cards = forwardRef((props, ref) => {
  const cellRefs = useRef({});
  const progressRefs = useRef({});

  const labelConfig = {
    aqi: { label: "AQI", unit: "", max: 500, color: "bg-red-500" },
    humidity: { label: "Humidity", unit: "%", max: 100, color: "bg-blue-500" },
    rainfall: { label: "Rainfall", unit: " mm", max: 50, color: "bg-cyan-500" },
    temperature: { label: "Temperature", unit: "°C", max: 50, color: "bg-orange-500" },
    vibration: { label: "Vibration", unit: " Hz", max: 10, color: "bg-purple-500" },
    visitor_count: { label: "Visitor Count", unit: "", max: 1000, color: "bg-green-500" },
  };

  useImperativeHandle(ref, () => ({
    update: (newData) => {
      if (!newData) return;
      Object.entries(newData).forEach(([key, value]) => {
        const config = labelConfig[key];
        
        // Update Text
        if (cellRefs.current[key]) {
          cellRefs.current[key].innerText = `${value}${config?.unit || ""}`;
        }

        // Update Progress Bar Width
        if (progressRefs.current[key] && config) {
          const percentage = Math.min((value / config.max) * 100, 100);
          progressRefs.current[key].style.width = `${percentage}%`;
          
          // Add a brief "flash" effect to show data changed
          progressRefs.current[key].style.opacity = "0.7";
          setTimeout(() => {
            if(progressRefs.current[key]) progressRefs.current[key].style.opacity = "1";
          }, 200);
        }
      });
    },
  }));

  return (
    <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden border">
      <Table>
        <TableCaption className="mb-2">Live Telemetric Data</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[120px]">Parameter</TableHead>
            <TableHead className="px-2 text-center">Level</TableHead>
            <TableHead className="text-right pr-6 w-[100px]">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(labelConfig).map(([key, config]) => (
            <TableRow key={key} className="h-12">
              <TableCell className="font-medium capitalize pl-6 whitespace-nowrap">
                {config.label}
              </TableCell>
              
              {/* Progress Bar Column */}
              <TableCell className="px-2 min-w-[120px]">
                <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-sm h-3 overflow-hidden border border-gray-300">
                  <div
                    ref={(el) => (progressRefs.current[key] = el)}
                    className={"bg-black h-full transition-all duration-700 ease-in-out origin-left"}
                    style={{ width: "0%" }}
                  />
                </div>
              </TableCell>

              <TableCell
                ref={(el) => (cellRefs.current[key] = el)}
                className="text-right pr-6 font-mono font-bold text-sm tabular-nums"
              >
                --
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

Cards.displayName = "Cards";
export default Cards;










































// import React, { useImperativeHandle, useRef, forwardRef } from "react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"

// const Cards = forwardRef((props, ref) => {
//   // FIX: Define as a single Ref holding an object
//   const cellRefs = useRef({}); 

//   const labelConfig = {
//     aqi: { label: "AQI", unit: "" },
//     humidity: { label: "Humidity", unit: "%" },
//     rainfall: { label: "Rainfall", unit: " mm" },
//     temperature: { label: "Temperature", unit: "°C" },
//     vibration: { label: "Vibration", unit: " Hz" },
//     visitor_count: { label: "Visitor Count", unit: "" },
//   };

//   useImperativeHandle(ref, () => ({
//     update: (newData) => {
//       if (!newData) return;
//       Object.entries(newData).forEach(([key, value]) => {
//         // Access the specific DOM element inside the ref object
//         const element = cellRefs.current[key];
//         if (element) {
//           const unit = labelConfig[key]?.unit || "";
//           element.innerText = `${value}${unit}`;
//         }
//       });
//     },
//   }));

//   return (
//     <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden">
//       <Table>
//         <TableCaption>Telemetric Data From IOT Devices</TableCaption>
//         <TableHeader>
//           <TableRow>
//             <TableHead className="w-[150px] pl-6">Parameters</TableHead>
//             <TableHead className="text-right pr-6">Values</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {Object.entries(labelConfig).map(([key, config]) => (
//             <TableRow key={key}>
//               <TableCell className="font-medium capitalize pl-6">
//                 {config.label}
//               </TableCell>
//               <TableCell
//                 // FIX: This correctly assigns the DOM element to our ref object
//                 ref={(el) => {
//                   if (el) cellRefs.current[key] = el;
//                 }}
//                 className="text-right pr-6 font-mono"
//               >
//                 --
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   );
// });

// Cards.displayName = "Cards";

// export default Cards;