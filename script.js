/* =========================================================
   STUDENT EXPENSE TRACKER
   FINAL VERSION
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const addExpenseBtn = document.getElementById("addExpenseBtn");

const expenseName = document.getElementById("expenseName");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const date = document.getElementById("date");

const expenseList = document.getElementById("expenseList");

const totalAmount = document.getElementById("totalAmount");
const totalTransactions = document.getElementById("totalTransactions");
const highestExpense = document.getElementById("highestExpense");

const foodExpense = document.getElementById("foodExpense");
const travelExpense = document.getElementById("travelExpense");
const shoppingExpense = document.getElementById("shoppingExpense");
const studyExpense = document.getElementById("studyExpense");
const monthlyExpense = document.getElementById("monthlyExpense");

const searchExpense = document.getElementById("searchExpense");
const filterCategory = document.getElementById("filterCategory");
const clearAllBtn = document.getElementById("clearAllBtn");

const chartFilter = document.getElementById("chartFilter");
const currentMonth = document.getElementById("currentMonth");

const expenseChartCanvas =
    document.getElementById("expenseChart");


/* =========================================================
   EXPENSE DATA
========================================================= */

let expenses = [];

try {

    expenses =
        JSON.parse(
            localStorage.getItem("expenses")
        ) || [];

    if (!Array.isArray(expenses)) {
        expenses = [];
    }

} catch (error) {

    expenses = [];

}


let expenseChart = null;

let editingExpenseId = null;


/* =========================================================
   CURRENT MONTH
========================================================= */

if (currentMonth) {

    currentMonth.textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

}


/* =========================================================
   TODAY DATE
========================================================= */

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "expenseToast"
        );


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "expenseToast";

        document.body.appendChild(toast);

    }


    toast.textContent =
        message;


    toast.className =
        `expense-toast ${type}`;


    requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    clearTimeout(
        window.expenseToastTimer
    );


    window.expenseToastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


/* =========================================================
   SAVE EXPENSES
========================================================= */

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    const number =
        Number(value) || 0;

    return (
        "₹" +
        number.toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "Invalid date";
    }


    const d =
        new Date(
            dateValue + "T00:00:00"
        );


    if (isNaN(d.getTime())) {
        return "Invalid date";
    }


    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CATEGORY ICON
========================================================= */

function getCategoryIcon(
    categoryName
) {

    const icons = {

        Food: "🍴",

        Travel: "🚌",

        Study: "📚",

        Shopping: "🛒",

        Other: "💰"

    };


    return (
        icons[categoryName] ||
        "💰"
    );

}


/* =========================================================
   CATEGORY CLASS
========================================================= */

function getCategoryClass(
    categoryName
) {

    return String(
        categoryName || "other"
    )
        .toLowerCase()
        .replace(
            /\s+/g,
            "-"
        );

}


/* =========================================================
   VALIDATE DATE
========================================================= */

function isValidDate(dateValue) {

    if (!dateValue) {
        return false;
    }


    const selectedDate =
        new Date(
            dateValue + "T00:00:00"
        );


    if (
        isNaN(
            selectedDate.getTime()
        )
    ) {

        return false;

    }


    const today =
        new Date(
            getTodayDate() +
            "T00:00:00"
        );


    return selectedDate <= today;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value ?? "");

    return div.innerHTML;

}


/* =========================================================
   ADD EXPENSE
========================================================= */

if (addExpenseBtn) {

    addExpenseBtn.addEventListener(
        "click",
        addNewExpense
    );

}


function addNewExpense() {

    const nameValue =
        expenseName.value.trim();

    const amountValue =
        Number(amount.value);

    const categoryValue =
        category.value;

    const dateValue =
        date.value;


    if (nameValue === "") {

        showToast(
            "Please enter an expense name.",
            "error"
        );

        expenseName.focus();

        return;

    }


    if (
        amount.value === "" ||
        amountValue <= 0 ||
        isNaN(amountValue)
    ) {

        showToast(
            "Please enter a valid amount.",
            "error"
        );

        amount.focus();

        return;

    }


    if (dateValue === "") {

        showToast(
            "Please select a date.",
            "error"
        );

        date.focus();

        return;

    }


    if (!isValidDate(dateValue)) {

        showToast(
            "Future dates are not allowed.",
            "error"
        );

        date.focus();

        return;

    }


    const expense = {

        id:
            Date.now() +
            Math.floor(
                Math.random() * 10000
            ),

        name:
            nameValue,

        amount:
            amountValue,

        category:
            categoryValue,

        date:
            dateValue

    };


    expenses.push(
        expense
    );


    saveExpenses();

    displayExpenses();


    expenseName.value = "";

    amount.value = "";

    date.value = "";


    if (category) {

        category.selectedIndex = 0;

    }


    showToast(
        "Expense added successfully! ✓",
        "success"
    );

}


/* =========================================================
   DISPLAY EXPENSES
========================================================= */

function displayExpenses() {

    if (!expenseList) {
        return;
    }


    expenseList.innerHTML = "";


    const searchText =
        searchExpense
            ? searchExpense.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        filterCategory
            ? filterCategory.value
            : "All";


    let visibleExpenses = 0;


    /* SORT NEWEST FIRST */

    const sortedExpenses =
        [...expenses].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        (a.date || "") +
                        "T00:00:00"
                    );

                const dateB =
                    new Date(
                        (b.date || "") +
                        "T00:00:00"
                    );


                if (
                    dateB.getTime() !==
                    dateA.getTime()
                ) {

                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }


                return (
                    Number(b.id) -
                    Number(a.id)
                );

            }
        );


    sortedExpenses.forEach(
        function (expense) {

            const expenseNameText =
                String(
                    expense.name || ""
                )
                    .toLowerCase();


            const matchesSearch =
                expenseNameText.includes(
                    searchText
                );


            const matchesCategory =
                selectedCategory === "All" ||
                expense.category ===
                    selectedCategory;


            if (
                !matchesSearch ||
                !matchesCategory
            ) {

                return;

            }


            visibleExpenses++;


            const expenseItem =
                document.createElement(
                    "div"
                );


            expenseItem.className =
                "expense-item";


            const safeName =
                escapeHTML(
                    expense.name
                );


            const safeCategory =
                escapeHTML(
                    expense.category
                );


            const categoryClass =
                getCategoryClass(
                    expense.category
                );


            expenseItem.innerHTML = `

                <div class="expense-left">

                    <div class="expense-icon">
                        ${getCategoryIcon(
                            expense.category
                        )}
                    </div>

                    <div class="expense-info">

                        <strong>
                            ${safeName}
                        </strong>

                        <div class="expense-meta">

                            <span>
                                📅
                                ${formatDate(
                                    expense.date
                                )}
                            </span>

                            <span
                                class="category-tag ${categoryClass}"
                            >
                                ${safeCategory}
                            </span>

                        </div>

                    </div>

                </div>


                <div class="expense-right">

                    <span class="expense-amount">
                        ${formatMoney(
                            expense.amount
                        )}
                    </span>


                    <button
                        class="edit-btn"
                        onclick="editExpense(${expense.id})"
                        title="Edit Expense"
                    >
                        ✏️
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteExpense(${expense.id})"
                        title="Delete Expense"
                    >
                        🗑️
                    </button>

                </div>

            `;


            expenseList.appendChild(
                expenseItem
            );

        }
    );


    /* EMPTY STATE */

    if (visibleExpenses === 0) {

        const emptyState =
            document.createElement(
                "div"
            );


        emptyState.className =
            "empty-state";


        if (expenses.length === 0) {

            emptyState.innerHTML = `

                <div class="empty-icon">
                    🧾
                </div>

                <h3>
                    No expenses yet
                </h3>

                <p>
                    Add your first expense
                    to start tracking
                    your spending.
                </p>

            `;

        } else {

            emptyState.innerHTML = `

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No matching expenses
                </h3>

                <p>
                    Try changing your
                    search or category filter.
                </p>

            `;

        }


        expenseList.appendChild(
            emptyState
        );

    }


    updateSummary();

    updateChart();

}


/* =========================================================
   UPDATE SUMMARY
========================================================= */

function updateSummary() {

    let total = 0;

    let foodTotal = 0;

    let travelTotal = 0;

    let shoppingTotal = 0;

    let studyTotal = 0;

    let monthlyTotal = 0;


    const now =
        new Date();


    expenses.forEach(
        function (expense) {

            const expenseAmount =
                Number(
                    expense.amount
                ) || 0;


            total +=
                expenseAmount;


            switch (
                expense.category
            ) {

                case "Food":

                    foodTotal +=
                        expenseAmount;

                    break;


                case "Travel":

                    travelTotal +=
                        expenseAmount;

                    break;


                case "Shopping":

                    shoppingTotal +=
                        expenseAmount;

                    break;


                case "Study":

                    studyTotal +=
                        expenseAmount;

                    break;

            }


            const expenseDate =
                new Date(
                    (expense.date || "") +
                    "T00:00:00"
                );


            if (

                expenseDate.getMonth() ===
                    now.getMonth()

                &&

                expenseDate.getFullYear() ===
                    now.getFullYear()

            ) {

                monthlyTotal +=
                    expenseAmount;

            }

        }
    );


    /* TOTAL */

    if (totalAmount) {

        totalAmount.textContent =
            formatMoney(total);

    }


    /* TRANSACTIONS */

    if (totalTransactions) {

        totalTransactions.textContent =
            expenses.length;

    }


    /* HIGHEST */

    if (highestExpense) {

        const highest =
            expenses.length > 0

                ? Math.max(
                    ...expenses.map(
                        expense =>
                            Number(
                                expense.amount
                            ) || 0
                    )
                )

                : 0;


        highestExpense.textContent =
            formatMoney(highest);

    }


    /* CATEGORY TOTALS */

    if (foodExpense) {

        foodExpense.textContent =
            formatMoney(foodTotal);

    }


    if (travelExpense) {

        travelExpense.textContent =
            formatMoney(travelTotal);

    }


    if (shoppingExpense) {

        shoppingExpense.textContent =
            formatMoney(shoppingTotal);

    }


    if (studyExpense) {

        studyExpense.textContent =
            formatMoney(studyTotal);

    }


    if (monthlyExpense) {

        monthlyExpense.textContent =
            formatMoney(monthlyTotal);

    }

}


/* =========================================================
   EDIT MODAL ELEMENTS
========================================================= */

const editExpenseModal =
    document.getElementById(
        "editExpenseModal"
    );


const editExpenseName =
    document.getElementById(
        "editExpenseName"
    );


const editExpenseAmount =
    document.getElementById(
        "editExpenseAmount"
    );


const editExpenseCategory =
    document.getElementById(
        "editExpenseCategory"
    );


const editExpenseDate =
    document.getElementById(
        "editExpenseDate"
    );


const saveEditBtn =
    document.getElementById(
        "saveEditBtn"
    );


const cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );


const closeEditModal =
    document.getElementById(
        "closeEditModal"
    );


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function editExpense(id) {

    const expense =
        expenses.find(
            item =>
                item.id === id
        );


    if (!expense) {
        return;
    }


    editingExpenseId =
        id;


    editExpenseName.value =
        expense.name || "";


    editExpenseAmount.value =
        expense.amount || "";


    editExpenseCategory.value =
        expense.category || "Other";


    editExpenseDate.value =
        expense.date || "";


    editExpenseDate.max =
        getTodayDate();


    if (editExpenseModal) {

        editExpenseModal.classList.add(
            "active"
        );

    }


    setTimeout(
        function () {

            editExpenseName.focus();

        },
        100
    );

}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModalWindow() {

    if (editExpenseModal) {

        editExpenseModal.classList.remove(
            "active"
        );

    }


    editingExpenseId =
        null;

}


/* =========================================================
   MODAL BUTTONS
========================================================= */

if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        closeEditModalWindow
    );

}


if (closeEditModal) {

    closeEditModal.addEventListener(
        "click",
        closeEditModalWindow
    );

}


if (editExpenseModal) {

    const overlay =
        editExpenseModal.querySelector(
            ".edit-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeEditModalWindow
        );

    }

}


/* =========================================================
   SAVE EDIT
========================================================= */

if (saveEditBtn) {

    saveEditBtn.addEventListener(
        "click",
        function () {

            if (
                editingExpenseId === null
            ) {

                return;

            }


            const expense =
                expenses.find(
                    item =>
                        item.id ===
                        editingExpenseId
                );


            if (!expense) {

                closeEditModalWindow();

                return;

            }


            const newName =
                editExpenseName.value.trim();


            const newAmount =
                Number(
                    editExpenseAmount.value
                );


            const newCategory =
                editExpenseCategory.value;


            const newDate =
                editExpenseDate.value;


            if (newName === "") {

                showToast(
                    "Please enter an expense name.",
                    "error"
                );

                editExpenseName.focus();

                return;

            }


            if (

                editExpenseAmount.value === ""

                ||

                newAmount <= 0

                ||

                isNaN(newAmount)

            ) {

                showToast(
                    "Please enter a valid amount.",
                    "error"
                );

                editExpenseAmount.focus();

                return;

            }


            if (newDate === "") {

                showToast(
                    "Please select a date.",
                    "error"
                );

                editExpenseDate.focus();

                return;

            }


            if (!isValidDate(newDate)) {

                showToast(
                    "Future dates are not allowed.",
                    "error"
                );

                editExpenseDate.focus();

                return;

            }


            expense.name =
                newName;


            expense.amount =
                newAmount;


            expense.category =
                newCategory;


            expense.date =
                newDate;


            saveExpenses();

            displayExpenses();

            closeEditModalWindow();


            showToast(
                "Expense updated successfully! ✓",
                "success"
            );

        }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (

            event.key === "Escape"

            &&

            editExpenseModal

            &&

            editExpenseModal.classList.contains(
                "active"
            )

        ) {

            closeEditModalWindow();

        }

    }
);


/* =========================================================
   DELETE EXPENSE
========================================================= */

function deleteExpense(id) {

    const expense =
        expenses.find(
            item =>
                item.id === id
        );


    if (!expense) {
        return;
    }


    const confirmDelete =
        confirm(
            `Delete "${expense.name}" expense?`
        );


    if (!confirmDelete) {
        return;
    }


    expenses =
        expenses.filter(
            item =>
                item.id !== id
        );


    saveExpenses();

    displayExpenses();


    showToast(
        "Expense deleted successfully.",
        "success"
    );

}


/* =========================================================
   CLEAR ALL
========================================================= */

if (clearAllBtn) {

    clearAllBtn.addEventListener(
        "click",
        function () {

            if (expenses.length === 0) {

                showToast(
                    "There are no expenses to delete.",
                    "error"
                );

                return;

            }


            const confirmDelete =
                confirm(
                    "Are you sure you want to delete all expenses?"
                );


            if (!confirmDelete) {
                return;
            }


            expenses = [];


            localStorage.removeItem(
                "expenses"
            );


            displayExpenses();


            showToast(
                "All expenses have been cleared.",
                "success"
            );

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

if (searchExpense) {

    searchExpense.addEventListener(
        "input",
        displayExpenses
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

if (filterCategory) {

    filterCategory.addEventListener(
        "change",
        displayExpenses
    );

}


/* =========================================================
   CHART FILTER
========================================================= */

if (chartFilter) {

    chartFilter.addEventListener(
        "change",
        updateChart
    );

}


/* =========================================================
   UPDATE CHART
========================================================= */

function updateChart() {

    const ctx =
        document.getElementById(
            "expenseChart"
        );


    if (!ctx) {
        return;
    }


    if (expenseChart) {

        expenseChart.destroy();

        expenseChart = null;

    }


    const categoryTotals = {

        Food: 0,

        Travel: 0,

        Study: 0,

        Shopping: 0,

        Other: 0

    };


    const selectedFilter =
        chartFilter
            ? chartFilter.value
            : "all";


    const now =
        new Date();


    expenses.forEach(
        function (expense) {

            const expenseDate =
                new Date(
                    (expense.date || "") +
                    "T00:00:00"
                );


            if (
                selectedFilter ===
                "month"
            ) {

                if (

                    expenseDate.getMonth() !==
                        now.getMonth()

                    ||

                    expenseDate.getFullYear() !==
                        now.getFullYear()

                ) {

                    return;

                }

            }


            if (
                Object.prototype.hasOwnProperty.call(
                    categoryTotals,
                    expense.category
                )
            ) {

                categoryTotals[
                    expense.category
                ] +=
                    Number(
                        expense.amount
                    ) || 0;

            }

        }
    );


    const labels = [];

    const data = [];

    const colors = [];


    const categoryColors = {

        Food: "#4A90E2",

        Travel: "#E85D75",

        Study: "#F4A340",

        Shopping: "#F2C14E",

        Other: "#55B7B1"

    };


    Object.keys(
        categoryTotals
    ).forEach(
        function (categoryName) {

            if (
                categoryTotals[
                    categoryName
                ] > 0
            ) {

                labels.push(
                    categoryName
                );


                data.push(
                    categoryTotals[
                        categoryName
                    ]
                );


                colors.push(
                    categoryColors[
                        categoryName
                    ]
                );

            }

        }
    );


    const total =
        data.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const chartContainer =
        ctx.parentElement;


    /* EMPTY CHART */

    if (total === 0) {

        if (chartContainer) {

            chartContainer.classList.add(
                "chart-empty"
            );


            let emptyMessage =
                chartContainer.querySelector(
                    ".chart-empty-message"
                );


            if (!emptyMessage) {

                emptyMessage =
                    document.createElement(
                        "div"
                    );


                emptyMessage.className =
                    "chart-empty-message";


                emptyMessage.innerHTML = `

                    <div>
                        📊
                    </div>

                    <strong>
                        No expense data yet
                    </strong>

                    <p>
                        Add some expenses to see
                        your spending breakdown.
                    </p>

                `;


                chartContainer.appendChild(
                    emptyMessage
                );

            }

        }


        return;

    }


    /* REMOVE EMPTY MESSAGE */

    if (chartContainer) {

        chartContainer.classList.remove(
            "chart-empty"
        );


        const oldMessage =
            chartContainer.querySelector(
                ".chart-empty-message"
            );


        if (oldMessage) {

            oldMessage.remove();

        }

    }


    /* CREATE CHART */

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    expenseChart =
        new Chart(
            ctx,
            {

                type: "doughnut",


                data: {

                    labels: labels,


                    datasets: [

                        {

                            data: data,

                            backgroundColor:
                                colors,

                            borderColor:
                                "#ffffff",

                            borderWidth: 3,

                            hoverOffset: 8

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "58%",


                    animation: {

                        duration: 700

                    },


                    plugins: {

                        legend: {

                            position:
                                "bottom",


                            labels: {

                                padding: 18,

                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                font: {

                                    size: 13,

                                    weight:
                                        "500"

                                }

                            }

                        },


                        tooltip: {

                            backgroundColor:
                                "rgba(35, 35, 50, 0.94)",

                            padding: 12,

                            cornerRadius: 9,


                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            Number(
                                                context.raw
                                            );


                                        const percentage =
                                            (
                                                (
                                                    value /
                                                    total
                                                ) *
                                                100
                                            ).toFixed(
                                                1
                                            );


                                        return (

                                            " ₹" +

                                            value.toLocaleString(
                                                "en-IN"
                                            ) +

                                            "  •  " +

                                            percentage +

                                            "%"

                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   DARK MODE
   Automatically adds a theme button.
========================================================= */

function createDarkMode() {

    const themeButton =
        document.createElement(
            "button"
        );


    themeButton.id =
        "themeToggle";


    themeButton.type =
        "button";


    themeButton.title =
        "Toggle dark mode";


    themeButton.setAttribute(
        "aria-label",
        "Toggle dark mode"
    );


    themeButton.innerHTML =
        "🌙";


    document.body.appendChild(
        themeButton
    );


    /* THEME CSS */

    const style =
        document.createElement(
            "style"
        );


    style.id =
        "darkModeStyles";


    style.textContent = `

        #themeToggle {

            position: fixed;

            right: 22px;

            bottom: 22px;

            width: 48px;

            height: 48px;

            border: none;

            border-radius: 50%;

            background:
                linear-gradient(
                    135deg,
                    #7660d8,
                    #5d48bd
                );

            color: white;

            font-size: 20px;

            cursor: pointer;

            z-index: 9998;

            box-shadow:
                0 8px 25px
                rgba(60, 45, 140, 0.25);

            transition:
                transform 0.25s ease,
                box-shadow 0.25s ease;

        }


        #themeToggle:hover {

            transform:
                translateY(-3px)
                rotate(8deg);

            box-shadow:
                0 12px 30px
                rgba(60, 45, 140, 0.35);

        }


        .expense-toast {

            position: fixed;

            top: 25px;

            right: 25px;

            z-index: 99999;

            padding:
                13px 20px;

            border-radius: 12px;

            color: white;

            font-size: 14px;

            font-weight: 600;

            opacity: 0;

            transform:
                translateY(-10px);

            pointer-events: none;

            box-shadow:
                0 10px 30px
                rgba(40, 35, 90, 0.20);

            transition:
                all 0.3s ease;

        }


        .expense-toast.show {

            opacity: 1;

            transform:
                translateY(0);

        }


        .expense-toast.success {

            background:
                linear-gradient(
                    135deg,
                    #7255D8,
                    #5D43C5
                );

        }


        .expense-toast.error {

            background:
                linear-gradient(
                    135deg,
                    #E56A83,
                    #D64E6C
                );

        }


        .empty-state {

            padding:
                45px 20px;

            text-align: center;

            color: #858da4;

        }


        .empty-icon {

            font-size: 42px;

            margin-bottom: 12px;

        }


        .empty-state h3 {

            margin-bottom: 7px;

            color: #4e5875;

            font-size: 17px;

        }


        .empty-state p {

            font-size: 13px;

        }


        .chart-empty {

            position: relative;

        }


        .chart-empty canvas {

            display: none;

        }


        .chart-empty-message {

            text-align: center;

            color: #858da4;

            padding: 70px 20px;

        }


        .chart-empty-message div {

            font-size: 42px;

            margin-bottom: 12px;

        }


        .chart-empty-message strong {

            display: block;

            color: #4e5875;

            font-size: 16px;

            margin-bottom: 7px;

        }


        .chart-empty-message p {

            font-size: 12px;

        }


        /* ======================
           DARK THEME
        ====================== */

        body.dark-mode {

            color: #e9e9f5;

            background:
                radial-gradient(
                    circle at 0% 0%,
                    rgba(
                        112,
                        87,
                        217,
                        0.16
                    ),
                    transparent 28%
                ),
                radial-gradient(
                    circle at 100% 15%,
                    rgba(
                        75,
                        134,
                        216,
                        0.14
                    ),
                    transparent 25%
                ),
                linear-gradient(
                    135deg,
                    #111426 0%,
                    #15182c 50%,
                    #17152b 100%
                );

        }


        body.dark-mode h1,

        body.dark-mode
        .panel-heading h2,

        body.dark-mode
        .expenses-title h2,

        body.dark-mode
        .edit-modal-header h2 {

            color: #f2f1ff;

        }


        body.dark-mode
        .header p,

        body.dark-mode
        .edit-modal-header p {

            color: #aeb3cc;

        }


        body.dark-mode
        .month-box {

            background:
                rgba(
                    31,
                    35,
                    58,
                    0.9
                );

            border-color:
                #303552;

            color: #d8dbea;

        }


        body.dark-mode
        .panel,

        body.dark-mode
        .expenses-panel {

            border-color:
                #303552;

        }


        body.dark-mode
        .add-panel {

            background:
                linear-gradient(
                    145deg,
                    #292035,
                    #211d35
                );

        }


        body.dark-mode
        .chart-panel {

            background:
                linear-gradient(
                    145deg,
                    #1c293d,
                    #211f39
                );

        }


        body.dark-mode
        .expenses-panel {

            background:
                linear-gradient(
                    145deg,
                    #202337,
                    #1c1f32
                );

        }


        body.dark-mode
        label {

            color: #c6c9db;

        }


        body.dark-mode
        .input-box,

        body.dark-mode
        .search-box,

        body.dark-mode
        .expense-actions select,

        body.dark-mode
        .chart-heading select {

            background:
                rgba(
                    31,
                    35,
                    58,
                    0.95
                );

            border-color:
                #383d5c;

            color: #e4e5f1;

        }


        body.dark-mode
        .input-box input,

        body.dark-mode
        .input-box select,

        body.dark-mode
        .search-box input {

            color: #e7e8f3;

        }


        body.dark-mode
        .input-box input::placeholder,

        body.dark-mode
        .search-box input::placeholder {

            color: #858ba5;

        }


        body.dark-mode
        .expense-item {

            background:
                rgba(
                    31,
                    35,
                    58,
                    0.92
                );

            border-color:
                #343951;

        }


        body.dark-mode
        .expense-info strong {

            color: #f0f0fa;

        }


        body.dark-mode
        .expense-meta {

            color: #a4a9bf;

        }


        body.dark-mode
        .expense-amount {

            color: #eeeeff;

        }


        body.dark-mode
        .category-tag {

            background:
                #302a52;

            color:
                #c8bcff;

        }


        body.dark-mode
        .edit-btn {

            background:
                #312d4c;

        }


        body.dark-mode
        .edit-btn:hover {

            background:
                #40385f;

        }


        body.dark-mode
        .delete-btn {

            background:
                #492d38;

        }


        body.dark-mode
        .delete-btn:hover {

            background:
                #5b3442;

        }


        body.dark-mode
        .empty-state h3,

        body.dark-mode
        .chart-empty-message strong {

            color: #e4e5f2;

        }


        body.dark-mode
        .empty-state,

        body.dark-mode
        .chart-empty-message {

            color: #989eb8;

        }


        body.dark-mode
        .edit-modal-overlay {

            background:
                rgba(
                    5,
                    7,
                    20,
                    0.70
                );

        }


        body.dark-mode
        .edit-modal-box {

            background:
                linear-gradient(
                    145deg,
                    #202339,
                    #191c30
                );

            border-color:
                #343953;

        }


        body.dark-mode
        .edit-modal-header {

            background:
                linear-gradient(
                    135deg,
                    #30294b,
                    #30233d
                );

            border-color:
                #393450;

        }


        body.dark-mode
        .modal-close {

            background:
                #30344d;

            color:
                #c7cbdd;

        }


        body.dark-mode
        .modal-cancel-btn {

            background:
                #292d45;

            border-color:
                #454a64;

            color:
                #d2d5e3;

        }


        body.dark-mode
        .modal-cancel-btn:hover {

            background:
                #353a55;

        }


        @media (max-width: 650px) {

            #themeToggle {

                width: 44px;

                height: 44px;

                right: 15px;

                bottom: 15px;

            }

            .expense-toast {

                left: 15px;

                right: 15px;

                top: 15px;

                text-align: center;

            }

        }

    `;


    document.head.appendChild(
        style
    );


    /* LOAD SAVED THEME */

    const savedTheme =
        localStorage.getItem(
            "expenseTheme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

        themeButton.innerHTML =
            "☀️";

    } else {

        themeButton.innerHTML =
            "🌙";

    }


    /* TOGGLE */

    themeButton.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );


            if (isDark) {

                localStorage.setItem(
                    "expenseTheme",
                    "dark"
                );

                themeButton.innerHTML =
                    "☀️";

                themeButton.title =
                    "Switch to light mode";

            } else {

                localStorage.setItem(
                    "expenseTheme",
                    "light"
                );

                themeButton.innerHTML =
                    "🌙";

                themeButton.title =
                    "Switch to dark mode";

            }

        }
    );

}


/* =========================================================
   SET MAX DATE
========================================================= */

if (date) {

    date.max =
        getTodayDate();

}


/* =========================================================
   EDIT DATE MAX
========================================================= */

if (editExpenseDate) {

    editExpenseDate.max =
        getTodayDate();

}


/* =========================================================
   INITIALIZE DARK MODE
========================================================= */

createDarkMode();


/* =========================================================
   INITIAL LOAD
========================================================= */

displayExpenses();