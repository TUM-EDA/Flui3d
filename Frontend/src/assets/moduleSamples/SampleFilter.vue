<template>
    <defs>
        <mask id="filter">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <g fill="black" v-for="(y,index) in [35, 50, 65]" :key="index">
                <circle v-for="(x,idx) in [46, 65, 85, 105]" :key="idx" :cx="x" :cy="y" r="5" fill="black" stroke="none" />
            </g>
        </mask>
    </defs>
    <rect x="25" y="20" width="100" height="60" rx="10" ry="10" mask="url(#filter)" stroke="none" />
</template>