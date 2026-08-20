 "use client";
import {useEffect,useMemo,useState} from "react";

export type Language = "en"|"bg";

const bg:Record<string,string>={
  "Building Manager":"Домоуправител",
  "Manager Portal":"Портал за управителя",
  "Resident Portal":"Портал за живущи",
  "Sign out":"Изход",
  "Sign in to continue.":"Влезте, за да продължите.",
  "Create a manager account.":"Създайте акаунт на управител.",
  "Full name":"Име",
  "Email":"Имейл",
  "Password":"Парола",
  "Log in":"Вход",
  "Create manager account":"Създай акаунт на управител",
  "Create a manager account":"Създай акаунт на управител",
  "Back to login":"Обратно към вход",
  "Loading…":"Зареждане…",
  "Loading Building Manager…":"Зареждане…",
  "Please sign in.":"Моля, влезте в профила си.",
  "Hello":"Здравей",
  "Tap to make a direct report":"Натиснете за директен сигнал",
  "Apartment":"Апартамент",
  "Monthly fee":"Месечна такса",
  "Due":"Падеж",
  "Paid":"Платено",
  "Overdue":"Просрочено",
  "Due today":"Падеж днес",
  "Due tomorrow":"Падеж утре",
  "My Active Issues":"Моите активни сигнали",
  "No active issues.":"Няма активни сигнали.",
  "Bigger issue":"Сериозен проблем",
  "Small discomfort":"Дребен проблем",
  "Callback requested":"Поискано обратно обаждане",
  "Notifications":"Известия",
  "No building notices yet.":"Все още няма съобщения за сградата.",
  "Report an issue":"Подай сигнал",
  "Description":"Описание",
  "Request a callback":"Поискай обратно обаждане",
  "Submit Report":"Изпрати сигнал",
  "Cancel":"Отказ",
  "Building Community":"Общност на сградата",
  "Status only — issue details remain private.":"Показва се само статус — детайлите по сигналите остават поверителни.",
  "No active issue":"Няма активен сигнал",
  "Direct report":"Директен сигнал",
  "Manager Dashboard":"Табло на управителя",
  "Choose which building you want to manage.":"Изберете коя сграда искате да управлявате.",
  "Building":"Сграда",
  "Create New Building":"Създай нова сграда",
  "No buildings are assigned to this management company yet.":"Все още няма сгради към тази управляваща компания.",
  "Building Status":"Статус на сградата",
  "Live resident overview by apartment.":"Текущ преглед на живущите по апартаменти.",
  "Issue Dashboard":"Табло със сигнали",
  "Active issues are separated from resolved history.":"Активните сигнали са отделени от приключените.",
  "Active":"Активни",
  "Yellow":"Жълти",
  "Red":"Червени",
  "Resolved":"Приключени",
  "Showing":"Показва",
  "Back to active":"Обратно към активните",
  "No issues in this filter.":"Няма сигнали в този филтър.",
  "Acknowledge":"Приеми",
  "In Progress":"В процес",
  "Resolve":"Приключи",
  "Apartment Overview":"Преглед на апартамент",
  "Tenant, fees and issue history for one apartment.":"Наемател, такси и история на сигналите за избрания апартамент.",
  "Tenant":"Наемател",
  "Vacant":"Свободен",
  "VACANT":"СВОБОДЕН",
  "Active tenant account":"Активен акаунт на живущ",
  "No active tenant":"Няма активен живущ",
  "Manage Tenant":"Управление на живущ",
  "Hide Tenant Manager":"Скрий управлението",
  "Tenant Management":"Управление на живущ",
  "Manage the current tenant or invitation for this apartment.":"Управлявайте текущия живущ или поканата за този апартамент.",
  "Active tenant since":"Активен живущ от",
  "Phone":"Телефон",
  "End Tenancy":"Прекрати настаняването",
  "Replace Tenant":"Смени живущия",
  "Invitation Pending":"Чакаща покана",
  "INVITED":"ПОКАНЕН",
  "Status":"Статус",
  "Revoke Invitation":"Отмени поканата",
  "Copy Invite Link":"Копирай линка",
  "Apartment is vacant":"Апартаментът е свободен",
  "Invite Tenant":"Покани живущ",
  "Issue History":"История на сигналите",
  "Fee History":"История на таксите",
  "Fee Settings":"Настройки на таксата",
  "No issue history for this apartment.":"Няма история на сигнали за този апартамент.",
  "No fee history for this apartment.":"Няма история на такси за този апартамент.",
  "Monthly fee (€)":"Месечна такса (€)",
  "Recurring due day each month":"Ден за плащане всеки месец",
  "Save Apartment Fee":"Запази таксата",
  "Pending Tenant Fees":"Неплатени такси",
  "Outstanding fees for the selected building.":"Неплатени такси за избраната сграда.",
  "No pending fees.":"Няма неплатени такси.",
  "Mark Paid":"Маркирай като платено",
  "Publish Building Notice":"Публикувай съобщение",
  "Notice type":"Тип съобщение",
  "Planned works":"Планирани дейности",
  "General announcement":"Общо съобщение",
  "Important notice":"Важно съобщение",
  "Title":"Заглавие",
  "Message":"Съобщение",
  "Starts":"Начало",
  "Ends":"Край",
  "Publish Notice":"Публикувай",
  "Tenant Invitation Link":"Линк за покана",
  "Send this secure link to the invited tenant.":"Изпратете този защитен линк на поканения живущ.",
  "Close":"Затвори",
  "Copy Link":"Копирай линка",
  "Tenant email":"Имейл на живущия",
  "Create Invitation":"Създай покана",
  "Create New Building":"Създай нова сграда",
  "New building setup":"Настройка на нова сграда",
  "Back to Dashboard":"Обратно към таблото",
  "Create New Building":"Създай нова сграда",
  "Building name":"Име на сградата",
  "Address":"Адрес",
  "City":"Град",
  "Postal code":"Пощенски код",
  "Number of apartments":"Брой апартаменти",
  "Create Building":"Създай сграда",
  "Creating Building…":"Създаване…",
  "Tenant invitation":"Покана за живущ",
  "Checking invitation…":"Проверка на поканата…",
  "Complete Invitation":"Завърши поканата",
  "Invitation accepted. Your account is now linked to Apartment":"Поканата е приета. Профилът ви вече е свързан с апартамент",

  "Invitation accepted. Your account is now linked to Apartment":"Поканата е приета. Профилът ви вече е свързан с апартамент",
  "Open Building Manager":"Отвори приложението",
  "Invitation not found.":"Поканата не е намерена.",
  "Create Tenant Account":"Създай акаунт на живущ",
  "Tenant name":"Име на живущия",
  "The invitation is locked to this apartment.":"Поканата е свързана с този апартамент.",
};

export function useLanguage(){
  const[language,setLanguageState]=useState<Language>("en");

  useEffect(()=>{
    const saved=localStorage.getItem("bm_language");
    if(saved==="bg"||saved==="en")setLanguageState(saved);
  },[]);

  function setLanguage(value:Language){
    setLanguageState(value);
    localStorage.setItem("bm_language",value);
    window.dispatchEvent(new Event("bm-language-change"));
  }

  useEffect(()=>{
    const listener=()=>{
      const saved=localStorage.getItem("bm_language");
      if(saved==="bg"||saved==="en")setLanguageState(saved);
    };
    window.addEventListener("bm-language-change",listener);
    return()=>window.removeEventListener("bm-language-change",listener);
  },[]);

  const t=useMemo(()=>(
    key:string, vars?:Record<string,string|number>
  )=>{
    let value=language==="bg"?(bg[key]||key):key;
    if(vars)for(const[k,v]of Object.entries(vars))value=value.replaceAll(`{${k}}`,String(v));
    return value;
  },[language]);

  return {language,setLanguage,t,dateLocale:language==="bg"?"bg-BG":"en-GB"};
}
