// Bluetooth Printer Constants and Functions
const BluetoothPrinter = {
    // Service and Characteristic UUIDs
    PRINTER_SERVICE_UUID: '000018f0-0000-1000-8000-00805f9b34fb',
    PRINTER_CHARACTERISTIC_UUID: '00002af1-0000-1000-8000-00805f9b34fb',

    // Connection state
    device: null,
    characteristic: null,
    isConnected: false,

    // Connect to printer
    async connectToPrinter() {
        try {
            console.log('Requesting Bluetooth Device...');
            this.device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [this.PRINTER_SERVICE_UUID]
            });

            console.log('Connecting to GATT Server...');
            const server = await this.device.gatt.connect();

            console.log('Getting Printer Service...');
            const service = await server.getPrimaryService(this.PRINTER_SERVICE_UUID);

            console.log('Getting Printer Characteristic...');
            this.characteristic = await service.getCharacteristic(this.PRINTER_CHARACTERISTIC_UUID);

            this.isConnected = true;
            console.log('Connected to printer!');
            return true;
        } catch (error) {
            console.error('Error connecting to printer:', error);
            this.isConnected = false;
            return false;
        }
    },

    // Disconnect from printer
    async disconnect() {
        if (this.device && this.device.gatt.connected) {
            await this.device.gatt.disconnect();
            this.isConnected = false;
            console.log('Disconnected from printer');
        }
    },

    // Print text
    async printText(text) {
        if (!this.isConnected || !this.characteristic) {
            throw new Error('Printer not connected');
        }

        try {
            // Convert text to bytes
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            // Send data to printer
            await this.characteristic.writeValue(data);
            console.log('Text sent to printer');
        } catch (error) {
            console.error('Error printing text:', error);
            throw error;
        }
    },

    // Cut paper
    async cutPaper() {
        if (!this.isConnected || !this.characteristic) {
            throw new Error('Printer not connected');
        }

        try {
            const cutCommand = '\x1D\x56\x41';
            const encoder = new TextEncoder();
            const cutData = encoder.encode(cutCommand);

            await this.characteristic.writeValue(cutData);
            console.log('Paper cut command sent');
        } catch (error) {
            console.error('Error cutting paper:', error);
            throw error;
        }
    }
};

// Export the BluetoothPrinter object
window.BluetoothPrinter = BluetoothPrinter;

// Add the printToBluetoothPrinter function that will be called from Blazor
window.printToBluetoothPrinter = async function(text) {
    try {
        if (!window.BluetoothPrinter.isConnected) {
            const connected = await window.BluetoothPrinter.connectToPrinter();
            if (!connected) {
                throw new Error('Failed to connect to printer');
            }
        }

        await window.BluetoothPrinter.printText(text);
        await window.BluetoothPrinter.cutPaper();
        await window.BluetoothPrinter.disconnect();
    } catch (error) {
        console.error('Error in printToBluetoothPrinter:', error);
        throw error;
    }
}; 