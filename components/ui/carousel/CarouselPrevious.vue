<script setup lang="ts">
import type { WithClassAsProps } from "./interface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "@radix-icons/vue";
import { useCarousel } from "./useCarousel";

const props = defineProps<WithClassAsProps>();

const { orientation, canScrollPrev, scrollPrev } = useCarousel();
</script>

<template>
  <Button
    :disabled="!canScrollPrev"
    :class="
      cn(
        'touch-manipulation absolute h-10 w-10 rounded-full p-0',
        orientation === 'horizontal'
          ? '-left-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        props.class
      )
    "
    variant="outline"
    @click="scrollPrev"
  >
    <slot>
      <ArrowLeftIcon class="h-7 w-7 text-bold" />
      <span class="sr-only">Previous Slide</span>
    </slot>
  </Button>
</template>
