// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { RideStatusUpdateService, RideStatusUpdate, RideStatus } from '@core/services';
// import { AuthService } from '@core/services';
// import { Subscription } from 'rxjs';

// /**
//  * Example component showing how to subscribe to ride status updates
//  *
//  * Usage in your customer component:
//  * 1. Inject RideStatusUpdateService
//  * 2. Subscribe to updates using customer ID
//  * 3. Handle status changes in the subscription callback
//  * 4. Unsubscribe in ngOnDestroy
//  */
// @Component({
//     selector: 'app-customer-ride-status-example',
//     template: `
//     <div class="ride-status-container">
//       <h3>Current Ride Status: {{ currentStatus }}</h3>
//       <div *ngIf="lastUpdate">
//         <p>Last update: {{ lastUpdate.timestamp | date:'short' }}</p>
//         <p>Ride ID: {{ lastUpdate.rideId }}</p>
//       </div>
//     </div>
//   `,
//     styles: [`
//     .ride-status-container {
//       padding: 20px;
//       background: #f5f5f5;
//       border-radius: 8px;
//     }
//   `]
// })
// export class CustomerRideStatusExampleComponent implements OnInit, OnDestroy {
//     private statusSubscription?: Subscription;
//     currentStatus: string = 'No active ride';
//     lastUpdate?: RideStatusUpdate;

//     constructor(
//         private rideStatusService: RideStatusUpdateService,
//         private authService: AuthService
//     ) { }

//     ngOnInit() {
//         // Get customer ID from authenticated user
//         const userInfo = this.authService.getUserInfo();
//         if (!userInfo) {
//             console.error('User not authenticated');
//             return;
//         }

//         const customerId = userInfo.userId;

//         // Subscribe to ride status updates
//         this.statusSubscription = this.rideStatusService
//             .subscribeToRideStatusUpdates(customerId)
//             .subscribe({
//                 next: (update: RideStatusUpdate) => {
//                     console.log('Received ride status update:', update);

//                     if (update.type === 'RIDE_STATUS_UPDATE') {
//                         this.lastUpdate = update;
//                         this.currentStatus = this.getStatusDisplayText(update.status);

//                         // Show notification to user
//                         this.showStatusNotification(update.status);

//                         // Handle specific status changes
//                         this.handleStatusChange(update);
//                     }
//                 },
//                 error: (err) => {
//                     console.error('WebSocket error:', err);
//                 },
//                 complete: () => {
//                     console.log('WebSocket connection closed');
//                 }
//             });
//     }

//     ngOnDestroy() {
//         // Clean up subscription
//         this.statusSubscription?.unsubscribe();
//     }

//     private getStatusDisplayText(status: string): string {
//         const statusMap: Record<string, string> = {
//             [RideStatus.PENDING]: 'Finding a driver...',
//             [RideStatus.CONFIRMED]: 'Driver assigned!',
//             [RideStatus.PICKINGUP]: 'Driver is on the way',
//             [RideStatus.ONGOING]: 'Trip in progress',
//             [RideStatus.FINISHED]: 'Trip completed',
//             [RideStatus.REJECTED]: 'Ride cancelled'
//         };
//         return statusMap[status] || status;
//     }

//     private handleStatusChange(update: RideStatusUpdate) {
//         // Add custom logic for each status
//         switch (update.status) {
//             case RideStatus.CONFIRMED:
//                 // Maybe fetch driver details
//                 console.log('Ride confirmed, fetch driver info');
//                 break;
//             case RideStatus.PICKINGUP:
//                 // Start tracking driver location
//                 console.log('Driver picking up, start location tracking');
//                 break;
//             case RideStatus.ONGOING:
//                 // Show trip navigation
//                 console.log('Trip started, show navigation');
//                 break;
//             case RideStatus.FINISHED:
//                 // Show rating/payment screen
//                 console.log('Trip finished, show payment/rating');
//                 break;
//         }
//     }

//     private showStatusNotification(status: string) {
//         // Implement your notification logic here
//         // Could use Angular Material Snackbar, Toast notifications, etc.
//         console.log(`Notification: Ride status changed to ${status}`);
//     }
// }
