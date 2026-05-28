type PlanetKey = "solar" | "blackhole" | "nebula";

type PlanetItem = {
    key: PlanetKey;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    theme: string;
    detailTitle: string;
    detailBadge: string;
    detailDesc: string;
    detailFact: string;
};

type QuizOption = {
    id: string;
    label: string;
    correct: boolean;
};

const planetList: PlanetItem[] = [
    {
        key: "solar",
        title: "太阳系家族",
        subtitle: "Solar System",
        description: "由八大行星、卫星以及无数微型天体组成。",
        badge: "基础天文",
        theme: "orange",
        detailTitle: "太阳系家族 (Solar System)",
        detailBadge: "基础天文百科",
        detailDesc:
            "太阳系是以太阳为中心，以及所有受到太阳引力约束的天体集合。其中包括八大行星、天然卫星、矮行星和大量小天体。太阳占据了整个太阳系绝大部分质量，为地球持续提供光和热。",
        detailFact:
            "木星是太阳系最大的行星，它的质量比其他所有行星的总和还大得多，而著名的大红斑其实是一场持续多年的超级风暴。",
    },
    {
        key: "blackhole",
        title: "黑洞奥秘",
        subtitle: "Black Holes",
        description: "引力强大到连光都无法逃脱的超高密度星体。",
        badge: "深空物理",
        theme: "violet",
        detailTitle: "黑洞奥秘 (Black Holes)",
        detailBadge: "量子与宏观引力物理",
        detailDesc:
            "黑洞是宇宙中引力极其强大的天体。它的周围存在事件视界，一旦越过这条边界，包括光在内的任何物质都难以逃离。黑洞通常源于大质量恒星的坍缩。",
        detailFact:
            "2019 年人类首次拍摄到黑洞照片。靠近黑洞时，会因为极端引力差异产生被称为“面条化”的拉伸现象。",
    },
    {
        key: "nebula",
        title: "星云孕育场",
        subtitle: "Nebulae",
        description: "由尘埃和气体组成的巨大云雾，是恒星的摇篮。",
        badge: "星系演化",
        theme: "teal",
        detailTitle: "星云孕育场 (Nebulae)",
        detailBadge: "星际演化阶段",
        detailDesc:
            "星云由尘埃、氢气、氦气和其他电离气体组成，范围可达数十到数百光年。它们既可能是新恒星诞生的摇篮，也可能是恒星死亡后留下的壮观遗迹。",
        detailFact:
            "“创生之柱”位于鹰状星云内部，是著名的恒星形成区域，柱状气体结构中至今仍在孕育新的恒星。",
    },
];

const quizOptions: QuizOption[] = [
    { id: "a", label: "A. 3分钟左右", correct: false },
    { id: "b", label: "B. 8分钟左右", correct: true },
    { id: "c", label: "C. 一小时左右", correct: false },
];

Page({
    data: {
        planetList,
        quizOptions,
        selectedPlanet: planetList[0],
        showPlanetModal: false,
        selectedOptionId: "",
        answerStatus: "",
        answerFeedback: "",
    },

    onShow() {
        const tabBar = typeof this.getTabBar === "function" ? this.getTabBar() : null;
        if (tabBar && typeof (tabBar as any).setActive === "function") {
            (tabBar as any).setActive("/pages/explore/index");
        }
    },

    openPlanetDetail(event: WechatMiniprogram.BaseEvent) {
        const { key } = event.currentTarget.dataset as { key: PlanetKey };
        const selectedPlanet =
            planetList.find((item) => item.key === key) || planetList[0];

        this.setData({
            selectedPlanet,
            showPlanetModal: true,
        });
    },

    closePlanetDetail() {
        this.setData({
            showPlanetModal: false,
        });
    },

    answerQuestion(event: WechatMiniprogram.BaseEvent) {
        const { id } = event.currentTarget.dataset as { id: string };

        if (this.data.selectedOptionId) {
            return;
        }

        const current = quizOptions.find((item) => item.id === id);
        if (!current) {
            return;
        }

        this.setData({
            selectedOptionId: current.id,
            answerStatus: current.correct ? "correct" : "wrong",
            answerFeedback: current.correct
                ? "回答正确，太阳光到达地球约需 8 分 20 秒。"
                : "答错了，正确答案是 B：8 分钟左右。",
        });
    },

    resetAnswer() {
        this.setData({
            selectedOptionId: "",
            answerStatus: "",
            answerFeedback: "",
        });
    },

    goHome() {
        wx.switchTab({
            url: "/pages/index/index",
        });
    },

    goGame() {
        wx.switchTab({
            url: "/pages/game/index",
        });
    },

    noop() {},
});
