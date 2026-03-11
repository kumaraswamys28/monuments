const modelsData = [
  {
    id: 1,
    title:"Hampi Stone Chariot",
    url: "/model.glb",
    transform: { position: [0, -1, 0], rotation: [0, 180, 0], scale: 1.5 },
    iot_data:
      "https://ykdqxxsnhfxlncttgxrk.supabase.co/rest/v1/iot_data?order=timestamp.desc&limit=1",
    api_key:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHF4eHNuaGZ4bG5jdHRneHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjEyNjUsImV4cCI6MjA4NzM5NzI2NX0.68SqWEPDhLwvrWcpMLKklWsA96mLq2Bpw55QUb55zRE",
    items: [
        {
          title: "Dashboard",
          url: "#",
        },
         {
          title: "Analytics",
          url: "#",
        },
        // {
        //   title: "Billing",
        //   url: "#",
        // },
        // {
        //   title: "Limits",
        //   url: "#",
        // },
      ],
  },
    {
    id: 2,

   url: "/polee.glb",
    title:"Stamba",
    transform: { position: [0, 0, 0], rotation: [500, 60, 40], scale: 1.5 },
    iot_data:
      "https://ykdqxxsnhfxlncttgxrk.supabase.co/rest/v1/iot_data?order=timestamp.desc&limit=1",
    api_key:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHF4eHNuaGZ4bG5jdHRneHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjEyNjUsImV4cCI6MjA4NzM5NzI2NX0.68SqWEPDhLwvrWcpMLKklWsA96mLq2Bpw55QUb55zRE",
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
        {
          title: "Analytics",
          url: "#",
        },
        // {
        //   title: "Billing22",
        //   url: "#",
        // },
        // {
        //   title: "Limits22",
        //   url: "#",
        // },
      ],
  },{
    id: 3,
    url: "/temp.glb",
        // url: "/polee.glb",

    title:"Temple",
    transform: { position: [0, 0, 0], rotation: [0, 180, 0], scale: 1.5 },
    iot_data:
      "https://ykdqxxsnhfxlncttgxrk.supabase.co/rest/v1/iot_data?order=timestamp.desc&limit=1",
    api_key:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZHF4eHNuaGZ4bG5jdHRneHJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjEyNjUsImV4cCI6MjA4NzM5NzI2NX0.68SqWEPDhLwvrWcpMLKklWsA96mLq2Bpw55QUb55zRE",
      items: [
        {
          title: "Dashboard",
          url: "#",
        },
      {
          title: "Analytics",
          url: "#",
        },
        // {
        //   title: "Billing22",
        //   url: "#",
        // },
        // {
        //   title: "Limits22",
        //   url: "#",
        // },
      ],
  }
];




const fetchAllModels = () => modelsData.map(({ title, id, items }) => ({ title, id , items}));
const fetchModelById = (id) => {
  console.log(id);
  return modelsData.find((m) => m.id === id);
};

module.exports = { fetchAllModels, fetchModelById };
