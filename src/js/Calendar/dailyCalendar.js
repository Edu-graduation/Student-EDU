// // async function getDailySchedule() {
// //   const { data, error } = await supaClient
// //     .from("calendar_event")
// //     .select("*")
// //     .eq("student_id", studentId)
// //     .gte("event_startdatetime", startStr)
// //     .lte("event_startdatetime", endStr);
// //   if (error) {
// //     return;
// //   }
// //   if (data) {
// //     return data;
// //   }
// // }

// // // renderDailyEvents(getDailySchedule());
// // // async function renderDailyEvents(eventsArray) {
// // //   const events = await eventsArray;
// // //   let markup = "";
// // //   events.forEach((event, index) => {
// // //     const day = new Date(event.event_startdatetime).getDay();
// // //     const eventDate = new Date(event.event_startdatetime).getDate();
// // //     const today = new Date().getDate();
// // //     if (eventDate === today) {
// // //       markup += `
// // //         <div class="daily__event daily__event-${day + 2}" data-day=${day}>
// // //                     <p class="daily__event-time">${new Date(
// // //                       event.event_startdatetime
// // //                     ).toLocaleTimeString()}</p>
// // //                     <p class="daily__event-title">${event.event_name}</p>
// // //                     <p class="daliy__event-description">
// // //                       ${event.event_details}
// // //                     </p>
// // //                   </div>`;
// // //     }
// // //   });

// // //   dailySchedule.insertAdjacentHTML("beforeend", markup);
// // // }
// // // document.addEventListener("DOMContentLoaded", () => {
// // //   document.querySelectorAll(".calendar__day").forEach((dayEl) => {
// // //     let markup = "";
// // //     // Clear previous events
// // //     dayEl.addEventListener("click", async (e) => {
// // //       const selectedDay = +e.target.textContent;
// // //       const { data, error } = await supaClient
// // //         .from("calendar_event")
// // //         .select("*")
// // //         .eq("student_id", studentId)
// // //         .gte("event_startdatetime", startStr)
// // //         .lte("event_startdatetime", endStr);
// // //       if (error) {
// // //         return;
// // //       }
// // //       if (data) {
// // //         data.forEach((event) => {
// // //           const day = new Date(event.event_startdatetime).getDay();
// // //           if (new Date(event.event_startdatetime).getDate() === selectedDay) {
// // //             const number = day === 6 ? day - 5 : day + 2;
// // //             markup += `
// // //                 <div class="daily__event daily__event-${number}" data-day=${selectedDay}>
// // //                         <p class="daily__event-time">${new Date(
// // //                           event.event_startdatetime
// // //                         ).toLocaleTimeString()}</p>
// // //                         <p class="daily__event-title">${event.event_name}</p>
// // //                         <p class="daliy__event-description">
// // //                           ${event.event_details}
// // //                         </p>
// // //                       </div>`;
// // //           }
// // //         });
// // //       }
// // //       dailySchedule.innerHTML = markup;
// // //       markup = "";
// // //     });
// // //   });
// // // });

// import { supaClient } from "../app.js";
// import { subtractDates } from "../utilities/dateCalc.js";
// import { endStr, startStr } from "./weeklyCalendar.js";
// const dailySchedule = document.querySelector(".daily__event-container");
// const studentId = sessionStorage.getItem("studentId");
// const hours = [...document.querySelectorAll(".hour")];
// let timeHours = [];
// async function getDailySchedule() {
//   const { data, error } = await supaClient
//     .from("calendar_event")
//     .select("*")
//     .eq("student_id", studentId);
//   // .gte("event_startdatetime", startStr)
//   // .lte("event_startdatetime", endStr);
//   if (error) {
//     return;
//   }
//   if (data) {
//     return data;
//   }
// }
// renderDailyEvents(getDailySchedule());

// async function renderDailyEvents(eventsArray) {
//   const events = await eventsArray;
//   let markup = "";
//   // timeHours = events.map((event) => event.event_startdatetime);
//   // console.log(timeHours);
//   // Sort events by start time
//   events.sort(
//     (a, b) => new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//   );

//   events.forEach((event, index, arr) => {
//     const day = new Date(event.event_startdatetime).getDay();
//     const eventDate = new Date(event.event_startdatetime).getDate();
//     const today = new Date().getDate();
//     if (eventDate === today) {
//       timeHours.push(event.event_startdatetime);
//       markup += `
//         <div class="daily__event daily__event-${day + 2}" data-day=${day}>
//           <p class="daily__event-time">${new Date(
//             event.event_startdatetime
//           ).toLocaleTimeString()}</p>
//           <p class="daily__event-title">${event.event_name}</p>
//           <p class="daliy__event-description">
//             ${event.event_details}
//           </p>
//         </div>`;
//     }
//   });
//   console.log(timeHours);
//   timeHours.forEach((time, index, arr) => {
//     hours[index].textContent = new Date(time).toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//     hours[index].dataset.time = time;
//     hours[index].dataset.index = index;
//     hours.length = timeHours.length;
//   });
//   console.log(timeHours);
//   console.log(hours);
//   dailySchedule.insertAdjacentHTML("beforeend", markup);
// }

// export function attachDayClickListeners() {
//   document.querySelectorAll(".calendar__day").forEach((dayEl) => {
//     let markup = "";
//     // Clear previous events
//     dayEl.addEventListener("click", async (e) => {
//       const selectedDay = +e.target.textContent;

//       // Get the month and year information
//       const elementMonth = parseInt(dayEl.dataset.month);
//       const elementYear = parseInt(dayEl.dataset.year);

//       const { data, error } = await supaClient
//         .from("calendar_event")
//         .select("*")
//         .eq("student_id", studentId);
//       // .gte("event_startdatetime", startStr)
//       // .lte("event_startdatetime", endStr);

//       if (error) {
//         return;
//       }

//       if (data) {
//         // Sort events by start time
//         data.sort(
//           (a, b) =>
//             new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//         );

//         data.forEach((event) => {
//           const eventDate = new Date(event.event_startdatetime);
//           const eventDay = eventDate.getDate();
//           const eventMonth = eventDate.getMonth();
//           const eventYear = eventDate.getFullYear();

//           // Check if the event matches the selected day AND the correct month and year
//           if (
//             eventDay === selectedDay &&
//             eventMonth === elementMonth &&
//             eventYear === elementYear
//           ) {
//             const day = eventDate.getDay();
//             const number = day === 6 ? day - 5 : day + 2;

//             markup += `
//               <div class="daily__event daily__event-${number}" data-day=${selectedDay}>
//                 <p class="daily__event-time">${eventDate.toLocaleTimeString()}</p>
//                 <p class="daily__event-title">${event.event_name}</p>
//                 <p class="daliy__event-description">
//                   ${event.event_details}
//                 </p>
//               </div>`;
//           }
//         });
//       }

//       dailySchedule.innerHTML =
//         markup || `<p class="no-events">No events for this day</p>`;
//       markup = "";
//     });
//   });
// }
// document.addEventListener("DOMContentLoaded", () => {
//   // Initialize the click listeners for the initial calendar render
//   attachDayClickListeners();
// });
// import { supaClient } from "../app.js";
// import { subtractDates } from "../utilities/dateCalc.js";
// import { endStr, startStr } from "./weeklyCalendar.js";
// const dailySchedule = document.querySelector(".daily__event-container");
// const studentId = sessionStorage.getItem("studentId");
// const hoursContainer = document.querySelector(".time");
// const time = document.querySelector(".time");
// // Helper function to format time in a readable format
// function formatTimeDisplay(dateTimeStr) {
//   return new Date(dateTimeStr).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// // Helper function to clear and rebuild hours display
// function updateHoursDisplay(timeArray) {
//   // Clear existing hours
//   hoursContainer.innerHTML = "";

//   // If no events, display default hours
//   if (!timeArray || timeArray.length === 0) {
//     const defaultHours = [
//       "8:00 AM",
//       "10:00 AM",
//       "12:00 PM",
//       "2:00 PM",
//       "4:00 PM",
//       "6:00 PM",
//       "8:00 PM",
//     ];
//     defaultHours.forEach((time) => {
//       const hourElement = document.createElement("div");
//       hourElement.className = "hour";
//       hourElement.textContent = time;
//       hoursContainer.appendChild(hourElement);
//     });
//     return;
//   }

//   // Sort times chronologically
//   timeArray.sort((a, b) => new Date(a) - new Date(b));

//   // Create hour elements for each time
//   timeArray.forEach((time, index) => {
//     const hourElement = document.createElement("div");
//     hourElement.className = "hour";
//     hourElement.textContent = formatTimeDisplay(time);
//     hourElement.dataset.time = time;
//     hourElement.dataset.index = index;
//     hoursContainer.appendChild(hourElement);
//   });
// }

// async function getDailySchedule() {
//   const { data, error } = await supaClient
//     .from("calendar_event")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching calendar events:", error);
//     return [];
//   }

//   return data || [];
// }

// // Display today's events by default
// renderDailyEvents(getDailySchedule());

// async function renderDailyEvents(eventsPromise) {
//   const events = await eventsPromise;
//   let markup = "";
//   let timeHours = [];

//   // Sort events by start time
//   events.sort(
//     (a, b) => new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//   );

//   const today = new Date().getDate();

//   events.forEach((event) => {
//     const eventDate = new Date(event.event_startdatetime);
//     const eventDay = eventDate.getDate();

//     if (eventDay === today) {
//       timeHours.push(event.event_startdatetime);
//       const day = eventDate.getDay();
//       const number = day === 6 ? day - 5 : day + 2;

//       markup += `
//         <div class="daily__event daily__event-${number} ${
//         event.event_type === "student event" ? "student-event" : ""
//       }" data-day=${day}>
//           <p class="daily__event-time">${formatTimeDisplay(
//             event.event_startdatetime
//           )}</p>
//           <p class="daily__event-title">${event.event_name}</p>
//           <p class="daliy__event-description">
//             ${event.event_details}
//           </p>
//         </div>`;
//     }
//   });

//   // Update hours display
//   updateHoursDisplay(timeHours);

//   // Update events display
//   dailySchedule.innerHTML =
//     markup || `<p class="no-events">No events for today</p>`;
// }

// export function attachDayClickListeners() {
//   document.querySelectorAll(".calendar__day").forEach((dayEl) => {
//     dayEl.addEventListener("click", async (e) => {
//       // Clear previous content
//       dailySchedule.innerHTML = "";
//       let markup = "";
//       let selectedTimeHours = [];

//       const selectedDay = +e.target.textContent;
//       const elementMonth = parseInt(dayEl.dataset.month);
//       const elementYear = parseInt(dayEl.dataset.year);

//       const { data, error } = await supaClient
//         .from("calendar_event")
//         .select("*")
//         .eq("student_id", studentId);

//       if (error) {
//         console.error("Error fetching events:", error);
//         return;
//       }

//       if (data) {
//         // Sort events by start time
//         data.sort(
//           (a, b) =>
//             new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//         );

//         data.forEach((event) => {
//           const eventDate = new Date(event.event_startdatetime);
//           const eventDay = eventDate.getDate();
//           const eventMonth = eventDate.getMonth();
//           const eventYear = eventDate.getFullYear();

//           // Check if the event matches the selected day AND the correct month and year
//           if (
//             eventDay === selectedDay &&
//             eventMonth === elementMonth &&
//             eventYear === elementYear
//           ) {
//             selectedTimeHours.push(event.event_startdatetime);
//             const day = eventDate.getDay();
//             const number = day === 6 ? day - 5 : day + 2;

//             markup += `
//               <div class="daily__event daily__event-${number} ${
//               event.event_type === "student event" ? "student-event" : ""
//             }" data-day=${selectedDay}>
//                 <p class="daily__event-time">${formatTimeDisplay(
//                   event.event_startdatetime
//                 )}</p>
//                 <p class="daily__event-title">${event.event_name}</p>
//                 <p class="daliy__event-description">
//                   ${event.event_details}
//                 </p>
//               </div>`;
//           }
//         });
//       }
//       // Update hours display with the selected day's events
//       updateHoursDisplay(selectedTimeHours);
//       // Update events display
//       dailySchedule.innerHTML =
//         markup || `<p class="no-events">No events for this day</p>`;
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // Initialize the click listeners for the initial calendar render
//   attachDayClickListeners();
// });
// import { supaClient } from "../app.js";
// import { subtractDates } from "../utilities/dateCalc.js";
// import { endStr, startStr } from "./weeklyCalendar.js";

// const dailySchedule = document.querySelector(".daily__event-container");
// const studentId = sessionStorage.getItem("studentId");
// const hoursContainer = document.querySelector(".time");

// // Helper function to format time in a readable format
// function formatTimeDisplay(dateTimeStr) {
//   return new Date(dateTimeStr).toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// // Helper function to clear and rebuild hours display
// function updateHoursDisplay(timeArray) {
//   // Clear existing hours
//   hoursContainer.innerHTML = "";

//   // If no events, display default hours
//   if (!timeArray || timeArray.length === 0) {
//     const defaultHours = [
//       "8:00 AM",
//       "10:00 AM",
//       "12:00 PM",
//       "2:00 PM",
//       "4:00 PM",
//       "6:00 PM",
//       "8:00 PM",
//     ];
//     defaultHours.forEach((time) => {
//       const hourElement = document.createElement("div");
//       hourElement.className = "hour";
//       hourElement.textContent = time;
//       hoursContainer.appendChild(hourElement);
//     });
//     return;
//   }

//   // Sort times chronologically
//   timeArray.sort((a, b) => new Date(a) - new Date(b));

//   // Create hour elements for each time
//   timeArray.forEach((time, index) => {
//     const hourElement = document.createElement("div");
//     hourElement.className = "hour";
//     hourElement.textContent = formatTimeDisplay(time);
//     hourElement.dataset.time = time;
//     hourElement.dataset.index = index;
//     hoursContainer.appendChild(hourElement);
//   });
// }

// async function getDailySchedule() {
//   const { data, error } = await supaClient
//     .from("calendar_event")
//     .select("*")
//     .eq("student_id", studentId);

//   if (error) {
//     console.error("Error fetching calendar events:", error);
//     return [];
//   }

//   return data || [];
// }

// // Track the currently selected day for real-time updates
// let currentlySelectedDay = new Date().getDate();
// let currentlySelectedMonth = new Date().getMonth();
// let currentlySelectedYear = new Date().getFullYear();

// // Function to render a single event in the daily view
// function renderSingleDailyEvent(event) {
//   const eventDate = new Date(event.event_startdatetime);
//   const eventDay = eventDate.getDate();
//   const eventMonth = eventDate.getMonth();
//   const eventYear = eventDate.getFullYear();

//   // Check if this event belongs to the currently selected day
//   if (
//     eventDay === currentlySelectedDay &&
//     eventMonth === currentlySelectedMonth &&
//     eventYear === currentlySelectedYear
//   ) {
//     const day = eventDate.getDay();
//     const number = day === 6 ? day - 5 : day + 2;

//     const eventElement = document.createElement("div");
//     eventElement.className = `daily__event daily__event-${number} ${
//       event.event_type === "student event" ? "student-event" : ""
//     }`;
//     eventElement.dataset.day = day;
//     eventElement.dataset.eventId = event.event_id;
//     eventElement.innerHTML = `
//       <p class="daily__event-time">${formatTimeDisplay(
//         event.event_startdatetime
//       )}</p>
//       <p class="daily__event-title">${event.event_name}</p>
//       <p class="daliy__event-description">${event.event_details}</p>
//     `;

//     // Add to the container
//     dailySchedule.appendChild(eventElement);

//     // Update hours display if needed
//     const currentHours = Array.from(
//       hoursContainer.querySelectorAll(".hour")
//     ).map((hour) => hour.dataset.time);

//     if (!currentHours.includes(event.event_startdatetime)) {
//       // Need to update hours display
//       const allEvents = Array.from(document.querySelectorAll(".daily__event"));
//       const allTimes = allEvents.map((event) => {
//         const timeText = event.querySelector(".daily__event-time").textContent;
//         const date = new Date(
//           currentlySelectedYear,
//           currentlySelectedMonth,
//           currentlySelectedDay
//         );
//         const [time, period] = timeText.split(" ");
//         const [hour, minute] = time.split(":");
//         let hours = parseInt(hour);
//         if (period === "PM" && hours !== 12) hours += 12;
//         if (period === "AM" && hours === 12) hours = 0;
//         date.setHours(hours, parseInt(minute), 0, 0);
//         return date.toISOString();
//       });

//       allTimes.push(event.event_startdatetime);
//       updateHoursDisplay(allTimes);
//     }

//     return true;
//   }

//   return false;
// }

// // Function to remove an event from the daily view
// function removeDailyEvent(eventId) {
//   const eventElement = document.querySelector(
//     `.daily__event[data-event-id="${eventId}"]`
//   );
//   if (eventElement) {
//     eventElement.remove();

//     // Check if we need to update the hours
//     if (dailySchedule.children.length === 0) {
//       updateHoursDisplay([]);
//     } else {
//       // Recalculate the hours from remaining events
//       const allEvents = Array.from(document.querySelectorAll(".daily__event"));
//       const allTimes = allEvents.map((event) => {
//         // Extract time from the element
//         const timeText = event.querySelector(".daily__event-time").textContent;
//         // Convert to a date object for the current selected day
//         const date = new Date(
//           currentlySelectedYear,
//           currentlySelectedMonth,
//           currentlySelectedDay
//         );
//         const [time, period] = timeText.split(" ");
//         const [hour, minute] = time.split(":");
//         let hours = parseInt(hour);
//         if (period === "PM" && hours !== 12) hours += 12;
//         if (period === "AM" && hours === 12) hours = 0;
//         date.setHours(hours, parseInt(minute), 0, 0);
//         return date.toISOString();
//       });

//       updateHoursDisplay(allTimes);
//     }
//   }
// }

// async function renderDailyEvents(eventsPromise) {
//   const events = await eventsPromise;
//   let markup = "";
//   let timeHours = [];

//   // Clear previous content
//   dailySchedule.innerHTML = "";

//   // Update currently selected day to today
//   const today = new Date();
//   currentlySelectedDay = today.getDate();
//   currentlySelectedMonth = today.getMonth();
//   currentlySelectedYear = today.getFullYear();

//   // Sort events by start time
//   events.sort(
//     (a, b) => new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//   );

//   events.forEach((event) => {
//     const eventDate = new Date(event.event_startdatetime);
//     const eventDay = eventDate.getDate();
//     const eventMonth = eventDate.getMonth();
//     const eventYear = eventDate.getFullYear();

//     if (
//       eventDay === currentlySelectedDay &&
//       eventMonth === currentlySelectedMonth &&
//       eventYear === currentlySelectedYear
//     ) {
//       timeHours.push(event.event_startdatetime);
//       const day = eventDate.getDay();
//       const number = day === 6 ? day - 5 : day + 2;

//       markup += `
//         <div class="daily__event daily__event-${number} ${
//         event.event_type === "student event" ? "student-event" : ""
//       }" data-day=${day} data-event-id="${event.id}">
//           <p class="daily__event-time">${formatTimeDisplay(
//             event.event_startdatetime
//           )}</p>
//           <p class="daily__event-title">${event.event_name}</p>
//           <p class="daliy__event-description">
//             ${event.event_details}
//           </p>
//         </div>`;
//     }
//   });

//   // Update hours display
//   updateHoursDisplay(timeHours);

//   // Update events display
//   dailySchedule.innerHTML =
//     markup || `<p class="no-events">No events for today</p>`;
// }

// // Set up Supabase real-time subscription for daily view
// function setupDailyRealtimeSubscription() {
//   supaClient
//     .channel("daily_calendar_changes")
//     .on(
//       "postgres_changes",
//       {
//         event: "*",
//         schema: "public",
//         table: "calendar_event",
//         filter: `student_id=eq.${studentId}`,
//       },
//       (payload) => {
//         console.log("Daily view - Change received!", payload);

//         // Handle the different types of changes
//         switch (payload.eventType) {
//           case "INSERT":
//             // Add the new event if it belongs to the currently selected day
//             console.log(
//               "Checking if new event should be added to daily view:",
//               payload.new
//             );
//             if (renderSingleDailyEvent(payload.new)) {
//               console.log("Added new event to daily view");

//               // Sort events by time
//               const eventElements = Array.from(
//                 dailySchedule.querySelectorAll(".daily__event")
//               );
//               const sortedElements = eventElements.sort((a, b) => {
//                 const timeA = a.querySelector(".daily__event-time").textContent;
//                 const timeB = b.querySelector(".daily__event-time").textContent;
//                 return (
//                   new Date(`1/1/2000 ${timeA}`) - new Date(`1/1/2000 ${timeB}`)
//                 );
//               });

//               // Clear and re-append in sorted order
//               dailySchedule.innerHTML = "";
//               if (sortedElements.length === 0) {
//                 dailySchedule.innerHTML = `<p class="no-events">No events for this day</p>`;
//               } else {
//                 sortedElements.forEach((el) => dailySchedule.appendChild(el));
//               }
//             }
//             break;

//           case "UPDATE":
//             // For updates, remove the old event and add the updated one
//             console.log("Event updated, updating daily view");
//             removeDailyEvent(payload.new.id);
//             renderSingleDailyEvent(payload.new);
//             break;

//           case "DELETE":
//             // Remove the specific event
//             console.log("Removing deleted event from daily view:", payload.old);
//             removeDailyEvent(payload.old.id);
//             console.log("Deleted event from daily view");
//             // If no events left, show the "no events" message
//             if (dailySchedule.children.length === 0) {
//               dailySchedule.innerHTML = `<p class="no-events">No events for this day</p>`;
//             }
//             break;
//         }
//       }
//     )
//     .subscribe((status) => {
//       console.log("Daily view subscription status:", status);
//     });
// }

// export function attachDayClickListeners() {
//   document.querySelectorAll(".calendar__day").forEach((dayEl) => {
//     dayEl.addEventListener("click", async (e) => {
//       // Clear previous content
//       dailySchedule.innerHTML = "";
//       let markup = "";
//       let selectedTimeHours = [];

//       const selectedDay = +e.target.textContent;
//       const elementMonth = parseInt(dayEl.dataset.month);
//       const elementYear = parseInt(dayEl.dataset.year);

//       // Update currently selected day for real-time updates
//       currentlySelectedDay = selectedDay;
//       currentlySelectedMonth = elementMonth;
//       currentlySelectedYear = elementYear;

//       const { data, error } = await supaClient
//         .from("calendar_event")
//         .select("*")
//         .eq("student_id", studentId);

//       if (error) {
//         console.error("Error fetching events:", error);
//         return;
//       }

//       if (data) {
//         // Sort events by start time
//         data.sort(
//           (a, b) =>
//             new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
//         );

//         data.forEach((event) => {
//           const eventDate = new Date(event.event_startdatetime);
//           const eventDay = eventDate.getDate();
//           const eventMonth = eventDate.getMonth();
//           const eventYear = eventDate.getFullYear();
//           console.log(event);
//           // Check if the event matches the selected day AND the correct month and year
//           if (
//             eventDay === selectedDay &&
//             eventMonth === elementMonth &&
//             eventYear === elementYear
//           ) {
//             selectedTimeHours.push(event.event_startdatetime);
//             const day = eventDate.getDay();
//             const number = day === 6 ? day - 5 : day + 2;

//             markup += `
//               <div class="daily__event daily__event-${number} ${
//               event.event_type === "student event" ? "student-event" : ""
//             }" data-day=${selectedDay} data-event-id="${event.event_id}">
//                 <p class="daily__event-time">${formatTimeDisplay(
//                   event.event_startdatetime
//                 )}</p>
//                 <p class="daily__event-title">${event.event_name}</p>
//                 <p class="daliy__event-description">
//                   ${event.event_details}
//                 </p>
//               </div>`;
//           }
//         });
//       }
//       // Update hours display with the selected day's events
//       updateHoursDisplay(selectedTimeHours);
//       // Update events display
//       dailySchedule.innerHTML =
//         markup || `<p class="no-events">No events for this day</p>`;
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // Initialize the click listeners for the initial calendar render
//   attachDayClickListeners();

//   // Display today's events by default
//   renderDailyEvents(getDailySchedule());

//   // Setup real-time updates
//   setupDailyRealtimeSubscription();
// });

///////////////////// VERSION TWO ///////////////////////
import { supaClient } from "../app.js";
import { subtractDates } from "../utilities/dateCalc.js";
import { endStr, startStr } from "./weeklyCalendar.js";

const dailySchedule = document.querySelector(".daily__event-container");
const studentId = sessionStorage.getItem("studentId");
const hoursContainer = document.querySelector(".time");

// Helper function to format time in a readable format
function formatTimeDisplay(dateTimeStr) {
  return new Date(dateTimeStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Helper function to clear and rebuild hours display
function updateHoursDisplay(timeArray) {
  // Clear existing hours
  hoursContainer.innerHTML = "";

  // If no events, display default hours
  if (!timeArray || timeArray.length === 0) {
    const defaultHours = [
      "8:00 AM",
      "10:00 AM",
      "12:00 PM",
      "2:00 PM",
      "4:00 PM",
      "6:00 PM",
      "8:00 PM",
    ];
    defaultHours.forEach((time) => {
      const hourElement = document.createElement("div");
      hourElement.className = "hour";
      hourElement.textContent = time;
      hoursContainer.appendChild(hourElement);
    });
    return;
  }

  // Get unique times (to avoid duplicates)
  const uniqueTimes = [
    ...new Set(
      timeArray.map((time) =>
        new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      )
    ),
  ];

  // Sort times chronologically
  uniqueTimes.sort((a, b) => {
    return new Date(`1/1/2000 ${a}`) - new Date(`1/1/2000 ${b}`);
  });

  // Create hour elements for each time
  uniqueTimes.forEach((time, index) => {
    const hourElement = document.createElement("div");
    hourElement.className = "hour";
    hourElement.textContent = time;
    hourElement.dataset.time = time;
    hourElement.dataset.index = index;
    hoursContainer.appendChild(hourElement);
  });
}

async function getDailySchedule() {
  const { data, error } = await supaClient
    .from("calendar_event")
    .select("*")
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }

  return data || [];
}

// Track the currently selected day for real-time updates
let currentlySelectedDay = new Date().getDate();
let currentlySelectedMonth = new Date().getMonth();
let currentlySelectedYear = new Date().getFullYear();

// Group events by time to handle events with the same start time
function groupEventsByTime(events) {
  const groupedEvents = {};

  events.forEach((event) => {
    const timeKey = formatTimeDisplay(event.event_startdatetime);
    if (!groupedEvents[timeKey]) {
      groupedEvents[timeKey] = [];
    }
    groupedEvents[timeKey].push(event);
  });

  return groupedEvents;
}

// Function to render events in the daily view
async function renderDailyEvents(eventsPromise) {
  const events = await eventsPromise;
  let timeHours = [];

  // Clear previous content
  dailySchedule.innerHTML = "";

  // Update currently selected day to today
  const today = new Date();
  currentlySelectedDay = today.getDate();
  currentlySelectedMonth = today.getMonth();
  currentlySelectedYear = today.getFullYear();

  // Sort events by start time
  events.sort(
    (a, b) => new Date(a.event_startdatetime) - new Date(b.event_startdatetime)
  );

  // Filter events for the current day
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.event_startdatetime);
    const eventDay = eventDate.getDate();
    const eventMonth = eventDate.getMonth();
    const eventYear = eventDate.getFullYear();

    return (
      eventDay === currentlySelectedDay &&
      eventMonth === currentlySelectedMonth &&
      eventYear === currentlySelectedYear
    );
  });

  // If no events, show message
  if (todayEvents.length === 0) {
    dailySchedule.innerHTML = `<p class="no-events">No events for today</p>`;
    updateHoursDisplay([]);
    return;
  }

  // Group events by start time
  const groupedEvents = groupEventsByTime(todayEvents);

  // Store all times for the hours display
  todayEvents.forEach((event) => {
    timeHours.push(event.event_startdatetime);
  });

  // Create and append time blocks for each group of events
  Object.keys(groupedEvents)
    .sort((a, b) => {
      return new Date(`1/1/2000 ${a}`) - new Date(`1/1/2000 ${b}`);
    })
    .forEach((timeKey) => {
      const eventsAtTime = groupedEvents[timeKey];

      // Create a time block container for this time
      const timeBlock = document.createElement("div");
      timeBlock.className = "daily__time-block";

      // Create a time label
      // const timeLabel = document.createElement("div");
      // timeLabel.className = "daily__time-label";
      // timeLabel.textContent = timeKey;
      // dailySchedule.appendChild(timeLabel);

      // Create a row container for events at this time
      const eventRow = document.createElement("div");
      eventRow.className = "daily__event-row";

      // Add all events for this time
      eventsAtTime.forEach((event) => {
        const eventDate = new Date(event.event_startdatetime);
        const day = eventDate.getDay();
        const number = day === 6 ? day - 5 : day + 2;

        const eventElement = document.createElement("div");
        eventElement.className = `daily__event daily__event-${number} ${
          event.event_type === "student event" ? "student-event" : ""
        }`;
        eventElement.dataset.day = day;
        eventElement.dataset.eventId = event.event_id;

        eventElement.innerHTML = `
        <p class="daily__event-title">${event.event_name}</p>
        <p class="daliy__event-description">${event.event_details || ""}</p>
      `;

        eventRow.appendChild(eventElement);
      });

      timeBlock.appendChild(eventRow);
      dailySchedule.appendChild(timeBlock);
    });

  // Update hours display
  updateHoursDisplay(timeHours);
}

// Function to handle day clicks for event display
export function attachDayClickListeners() {
  document.querySelectorAll(".calendar__day").forEach((dayEl) => {
    dayEl.addEventListener("click", async (e) => {
      // Get the selected day's information
      const selectedDay = +e.target.textContent;
      const elementMonth = parseInt(dayEl.dataset.month);
      const elementYear = parseInt(dayEl.dataset.year);

      // Update currently selected day for real-time updates
      currentlySelectedDay = selectedDay;
      currentlySelectedMonth = elementMonth;
      currentlySelectedYear = elementYear;

      // Fetch events
      const { data, error } = await supaClient
        .from("calendar_event")
        .select("*")
        .eq("student_id", studentId);

      if (error) {
        console.error("Error fetching events:", error);
        dailySchedule.innerHTML = `<p class="no-events">Error loading events</p>`;
        return;
      }

      // Clear previous content
      dailySchedule.innerHTML = "";
      let timeHours = [];

      if (!data || data.length === 0) {
        dailySchedule.innerHTML = `<p class="no-events">No events for this day</p>`;
        updateHoursDisplay([]);
        return;
      }

      // Filter events for the selected day
      const selectedDayEvents = data.filter((event) => {
        const eventDate = new Date(event.event_startdatetime);
        const eventDay = eventDate.getDate();
        const eventMonth = eventDate.getMonth();
        const eventYear = eventDate.getFullYear();

        return (
          eventDay === selectedDay &&
          eventMonth === elementMonth &&
          eventYear === elementYear
        );
      });

      if (selectedDayEvents.length === 0) {
        dailySchedule.innerHTML = `<p class="no-events">No events for this day</p>`;
        updateHoursDisplay([]);
        return;
      }

      // Group events by start time
      const groupedEvents = groupEventsByTime(selectedDayEvents);

      // Store all times for the hours display
      selectedDayEvents.forEach((event) => {
        timeHours.push(event.event_startdatetime);
      });

      // Create and append time blocks for each group of events
      Object.keys(groupedEvents)
        .sort((a, b) => {
          return new Date(`1/1/2000 ${a}`) - new Date(`1/1/2000 ${b}`);
        })
        .forEach((timeKey) => {
          const eventsAtTime = groupedEvents[timeKey];

          // Create a time block container for this time
          const timeBlock = document.createElement("div");
          timeBlock.className = "daily__time-block";

          // Create a time label
          // const timeLabel = document.createElement("div");
          // timeLabel.className = "daily__time-label";
          // timeLabel.textContent = timeKey;
          // dailySchedule.appendChild(timeLabel);

          // Create a row container for events at this time
          const eventRow = document.createElement("div");
          eventRow.className = "daily__event-row";

          // Add all events for this time
          eventsAtTime.forEach((event) => {
            const eventDate = new Date(event.event_startdatetime);
            const day = eventDate.getDay();
            const number = day === 6 ? day - 5 : day + 2;

            const eventElement = document.createElement("div");
            eventElement.className = `daily__event daily__event-${number} ${
              event.event_type === "student event" ? "student-event" : ""
            }`;
            eventElement.dataset.day = day;
            eventElement.dataset.eventId = event.event_id;

            eventElement.innerHTML = `
            <p class="daily__event-title">${event.event_name}</p>
            <p class="daliy__event-description">${event.event_details || ""}</p>
          `;

            eventRow.appendChild(eventElement);
          });

          timeBlock.appendChild(eventRow);
          dailySchedule.appendChild(timeBlock);
        });

      // Update hours display
      updateHoursDisplay(timeHours);
    });
  });
}

// Function to set up real-time subscription
function setupDailyRealtimeSubscription() {
  supaClient
    .channel("daily_calendar_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "calendar_event",
        filter: `student_id=eq.${studentId}`,
      },
      (payload) => {
        console.log("Daily view - Change received!", payload);

        // For all changes, re-fetch and re-render to ensure proper grouping
        getDailySchedule().then((events) => {
          // Filter for currently selected day
          const filteredEvents = events.filter((event) => {
            const eventDate = new Date(event.event_startdatetime);
            return (
              eventDate.getDate() === currentlySelectedDay &&
              eventDate.getMonth() === currentlySelectedMonth &&
              eventDate.getFullYear() === currentlySelectedYear
            );
          });

          // Clear previous content
          dailySchedule.innerHTML = "";

          if (filteredEvents.length === 0) {
            dailySchedule.innerHTML = `<p class="no-events">No events for this day</p>`;
            updateHoursDisplay([]);
            return;
          }

          // Group and render events
          const groupedEvents = groupEventsByTime(filteredEvents);
          const timeHours = filteredEvents.map(
            (event) => event.event_startdatetime
          );

          // Create and append time blocks
          Object.keys(groupedEvents)
            .sort((a, b) => {
              return new Date(`1/1/2000 ${a}`) - new Date(`1/1/2000 ${b}`);
            })
            .forEach((timeKey) => {
              const eventsAtTime = groupedEvents[timeKey];

              // Create a time block container for this time
              const timeBlock = document.createElement("div");
              timeBlock.className = "daily__time-block";

              // Create a time label
              // const timeLabel = document.createElement("div");
              // timeLabel.className = "daily__time-label";
              // timeLabel.textContent = timeKey;
              // dailySchedule.appendChild(timeLabel);

              // Create a row container for events at this time
              const eventRow = document.createElement("div");
              eventRow.className = "daily__event-row";

              // Add all events for this time
              eventsAtTime.forEach((event) => {
                const eventDate = new Date(event.event_startdatetime);
                const day = eventDate.getDay();
                const number = day === 6 ? day - 5 : day + 2;

                const eventElement = document.createElement("div");
                eventElement.className = `daily__event daily__event-${number} ${
                  event.event_type === "student event" ? "student-event" : ""
                }`;
                eventElement.dataset.day = day;
                eventElement.dataset.eventId = event.event_id;

                eventElement.innerHTML = `
                <p class="daily__event-title">${event.event_name}</p>
                <p class="daliy__event-description">${
                  event.event_details || ""
                }</p>
              `;

                eventRow.appendChild(eventElement);
              });

              timeBlock.appendChild(eventRow);
              dailySchedule.appendChild(timeBlock);
            });

          // Update hours display
          updateHoursDisplay(timeHours);
        });
      }
    )
    .subscribe((status) => {
      console.log("Daily view subscription status:", status);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the click listeners for the initial calendar render
  attachDayClickListeners();

  // Display today's events by default
  renderDailyEvents(getDailySchedule());

  // Setup real-time updates
  setupDailyRealtimeSubscription();
});
