<template>
  <ion-badge :color="color">{{ label }}</ion-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonBadge } from '@ionic/vue';
import { ContractStatus, OfferStatus } from '@/types';

const props = defineProps<{
  status: ContractStatus | OfferStatus | string;
}>();

const color = computed(() => {
  switch (props.status) {
    case ContractStatus.Active:
    case OfferStatus.Accepted:
      return 'success';
    case ContractStatus.Completed:
      return 'medium';
    case ContractStatus.Overdue:
    case OfferStatus.Rejected:
      return 'danger';
    case OfferStatus.Pending:
      return 'warning';
    case OfferStatus.Expired:
      return 'medium';
    default:
      return 'primary';
  }
});

const label = computed(() => props.status.toUpperCase());
</script>

<style scoped>
ion-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 10px;
  letter-spacing: 0.5px;
}
</style>
